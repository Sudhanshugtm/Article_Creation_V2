# **Technical Specification: Wiki-Wizard (Context-Aware Article Creation)**

**Version:** 1.0  
**Status:** Draft  
**Target:** Engineering / Backend

## **1\. Overview**

The "Wiki-Wizard" is an intelligent interception layer that sits between the user's intent ("I want to write about X") and the article editor. Its primary goal is **Traffic Control**: mapping a raw text string to a semantic concept to enforce policy (BLP, COI) and provide structural guidance (Templates) before the user writes a single word.

## **2\. Core Logic Flow**

The backend logic must execute the following decision tree immediately after the user stops typing the article title.  
flowchart TD  
    A\[User Types Title\] \--\> B{Query Wikidata Label/Alias}  
      
    %% ZERO MATCHES PATH  
    B \-- No Match Found \--\> C\[Status: True Red Link\]  
    C \--\> D{Keyword Analysis}  
    D \-- Contains 'LLC', 'Inc', 'Company' \--\> E\[Inferred Taxonomy: Company\]  
    D \-- Generic \--\> F\[Taxonomy: Unclassified / General\]  
    E \--\> G\[Trigger: COI Check\]  
    F \--\> H\[Trigger: Standard Notability Warning\]

    %% MULTIPLE MATCHES PATH  
    B \-- Multiple Matches Found \--\> Amb{Ambiguity Check}  
    Amb \--\> Dis\[UI: Disambiguation Modal\]  
    Dis \-- User Selects Item \--\> I

    %% SINGLE MATCH PATH  
    B \-- Single Match Found (Q-Item) \--\> I{Check Sitelinks (enwiki)}  
      
    %% LIVE ARTICLE EXISTS  
    I \-- Mainspace Link Exists \--\> J\[Status: Live Duplicate\]  
    J \--\> K\[Action: Redirect to Edit Live Page\]  
      
    %% CONTENT GAP (No Live Article)  
    I \-- No Mainspace Link \--\> DraftCheck{Check Draft Namespace}  
      
    %% DRAFT ALREADY EXISTS  
    DraftCheck \-- Draft Exists \--\> DraftFound\[Status: Draft Duplicate\]  
    DraftFound \--\> JoinDraft\[Action: Redirect to Edit Existing Draft\]

    %% TRUE GAP (Proceed to Creation)  
    DraftCheck \-- No Draft Found \--\> L\[Status: Content Gap\]  
    L \--\> M{Check Property P31 (Instance Of)}  
      
    M \-- Q5 (Human) \--\> N\[Taxonomy: Biography\]  
    N \--\> O\[Trigger: BLP Safe Route\]  
      
    M \-- Q16521 (Taxon) \--\> P\[Taxonomy: Species\]  
    P \--\> Q\[Trigger: Species Guidance & Template\]  
      
    M \-- Q4830453 (Business) \--\> R\[Taxonomy: Organization\]  
    R \--\> S\[Trigger: COI Check\]  
      
    M \-- Other/Unknown \--\> T\[Taxonomy: General\]  
    T \--\> H

## **3\. API Implementation Guide**

### **Step A: The Wikidata Query (Identity Check)**

**Endpoint:** https://www.wikidata.org/w/api.php  
**Action:** wbsearchentities  
**Goal:** Find if the concept exists in the knowledge graph.  
**Request:**  
GET /w/api.php?action=wbsearchentities\&search={UserQuery}\&language=en\&format=json

**Response Handling:**

* **search: \[\] (Empty):** Proceed to **Step B (Keyword Inference)**.  
* **search: \[1 item\]:** Proceed to **Step C (Sitelink Check)**.  
* **search: \[\>1 items\]:** Trigger **UI Disambiguation Modal**.  
  * *Dev Note:* Display label and description to the user so they can choose between "Mercury (Planet)" vs "Mercury (Element)".

### **Step B: Keyword Inference (Fallback)**

*Triggered when Wikidata returns 0 results.* **Logic:** Regex match on the raw title string.

* **Company Pattern:** /(LLC|Inc\\.?|Corp\\.?|Ltd\\.?|Group|Holdings)/i \-\> **Route: COI Check**  
* **Default:** \-\> **Route: General Notability Warning**

### **Step C: Sitelink & Property Check (Taxonomy Mapping)**

*Triggered when a specific Q-Item is identified.* **Endpoint:** wbgetentities  
**Goal:** Check if enwiki article exists AND fetch P31 (Instance of) to map taxonomy.  
**Request:**  
GET /w/api.php?action=wbgetentities\&ids={Q\_ID}\&props=sitelinks|claims\&sitefilter=enwiki\&format=json

**Logic:**

1. **Check Live Duplicate:**  
   * If sitelinks.enwiki exists \-\> **STOP**. Show "Duplicate Found" screen. Redirect to title.  
2. **Check Taxonomy (Property P31):**  
   * Iterate through claims.P31:  
     * **Q5** (Human) \-\> **Route: BLP / Bio**  
     * **Q16521** (Taxon) \-\> **Route: Species**  
     * **Q4830453** (Business) OR **Q43229** (Organization) \-\> **Route: Company / COI**  
     * **Q1190554** (Occurrence) OR **Q1656682** (Event) \-\> **Route: Event**

### **Step D: Draft Namespace Check**

*Triggered only if no Live Article exists.* **Endpoint:** https://en.wikipedia.org/w/api.php (Local Wiki API, not Wikidata)  
**Goal:** Prevent duplicate drafts.  
**Request:**  
GET /w/api.php?action=query\&titles=Draft:{UserQuery}\&format=json

**Logic:**

* If pageid exists (not \-1) \-\> **STOP**. Show "Draft Exists" screen. Redirect to Draft:{UserQuery}.  
* If missing="" \-\> **PROCEED**. This is a **True Content Gap**.

## **4\. Taxonomy Configuration (Frontend Mapping)**

Map the detected Taxonomy ID to the specific UI Flow configuration.

| Taxonomy Key | Trigger Condition (P31) | UI Route | Template Snippet |
| :---- | :---- | :---- | :---- |
| **BIO** | Q5 (Human) | **Safe Route 2 (BLP)** | {{Infobox person... |
| **COMPANY** | Q4830453 (Business) | **Safe Route 1 (COI)** | {{Infobox company... |
| **SPECIES** | Q16521 (Taxon) | **Standard \+ Guidance** | {{Taxobox... |
| **EVENT** | Q1656682 (Event) | **Standard \+ Guidance** | {{Infobox event... |

## **5\. Developer Checklist**

* \[ \] **Rate Limiting:** Ensure Wikidata API calls are debounced (wait 500ms after user stops typing).  
* \[ \] **Error Handling:** If Wikidata API is down, fail gracefully to "Keyword Inference" (Step B).  
* \[ \] **Mobile Optimization:** The Disambiguation Modal must be touch-friendly.  
* \[ \] **Auth State:** Ensure user.is\_confirmed check happens *before* allowing Draft creation (to prevent anon spam if applicable).