# ABOUTME: Project-specific instructions for article creation design work
# ABOUTME: Captures design principles and thinking frameworks for Wikimedia projects

# Article Creation Design Project

## Core Design Principle: Think Across ALL Wikis

**NEVER assume English Wikipedia is the default context.**

When designing features for article creation (or any Wikimedia tool), always consider the full spectrum of wikis:

### Wiki Spectrum to Consider

| Category | Examples | Characteristics |
|----------|----------|-----------------|
| **Large** | English, German, French, Japanese | Strict policies, established processes (AFC, autoconfirmed), high scrutiny, many reviewers |
| **Medium** | Spanish, Russian, Italian, Chinese, Portuguese | Moderate policies, may have some review processes, growing communities |
| **Smaller** | Indonesian, Hindi, Arabic, Vietnamese, Thai | May be more welcoming to newcomers, fewer gatekeeping processes, need more contributors |
| **Very Small** | Many language editions | Often desperate for content, minimal barriers, small reviewer pool |

### What Varies Across Wikis

1. **Article creation permissions**
   - Some require autoconfirmed status (4 days + 10 edits)
   - Some allow anyone to create directly
   - Some have Articles for Creation (AFC) review queues
   - Some have no formal review process

2. **Notability standards**
   - English Wikipedia: very strict, well-documented
   - Smaller wikis: may accept topics that English wouldn't
   - Local notability: a person notable in Indonesia may not meet English Wikipedia standards but is perfect for Indonesian Wikipedia

3. **Review capacity**
   - Large wikis: many patrollers, fast review
   - Small wikis: few reviewers, long waits or no review at all

4. **User base**
   - Large wikis: mix of experts and newcomers
   - Small wikis: often newcomers ARE the community

### Design Implications

When designing ANY feature, ask:

1. **"Does this work for a wiki with no AFC process?"**
   - Don't assume drafts → review → publish flow exists everywhere

2. **"Does this work for a wiki with 5 active editors?"**
   - Don't assume there are reviewers, patrollers, or mentors available

3. **"Does this work for a first-time editor on Hindi Wikipedia?"**
   - Don't assume familiarity with Wikipedia jargon or processes

4. **"What's the UNIVERSAL user need vs. wiki-specific policy?"**
   - Universal: User wants to contribute knowledge
   - Wiki-specific: How that contribution gets validated

### The Universal User Journey

Regardless of wiki, users share these core needs:

1. **"I have something to write about"** → Topic/subject entry
2. **"Will this be accepted?"** → Eligibility/notability guidance
3. **"How do I write it well?"** → Structure and content guidance
4. **"What happens after I submit?"** → Clear expectations for next steps

### Framework: Design for the Smallest, Adapt for the Largest

- **Default experience**: Should work for a small wiki with no special processes
- **Progressive enhancement**: Add wiki-specific features (AFC, gates, etc.) as configuration
- **Never block on missing infrastructure**: If a wiki has no reviewers, the tool should still be useful

### Questions to Ask Every Design Review

- [ ] Would this confuse a newcomer on Indonesian Wikipedia?
- [ ] Does this assume English Wikipedia's AFC process exists?
- [ ] Are we using jargon that only English Wikipedia editors understand?
- [ ] Could a small wiki deploy this without extra infrastructure?
- [ ] What's the minimum viable experience that works everywhere?

## Account States to Consider

Users may be in different states across ANY wiki:

| State | Description | Capabilities (varies by wiki) |
|-------|-------------|-------------------------------|
| **Logged out / Temp account** | Anonymous editing with temporary identity | May or may not be able to create articles |
| **New registered** | Just created an account | Often restricted, may need to create drafts |
| **Autoconfirmed** | Met wiki's threshold (if any) | Usually full article creation |
| **Experienced** | Many edits, known to community | Full capabilities, may have extra tools |

**Key insight**: The SAME user state may have DIFFERENT capabilities on different wikis. Design for flexibility, not hardcoded rules.
