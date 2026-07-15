# Project Charter — Rankin Inlet, Arviat & Chesterfield Inlet Last Mile Wireless System

**Prepared for:** Community/ISP Sponsor — Rankin Inlet, Arviat & Chesterfield Inlet, Nunavut
**Prepared by:** Northern Wireless Inc. (NWI)
**Date:** July 15, 2026
**Reference:** NWI-CHTR-RANKIN-2026 · Rev 0
**Related documents:** `EquipmentDescription-nwi-last-mile-system.md`,
`ScopeOfSupplySummary-nwi-last-mile-system.md`, `RankinMockCostEstimate.xlsx`

---

## 1. Purpose & Authorization

This charter authorizes Northern Wireless Inc. (NWI) to plan, engineer, procure, install and
commission a fixed-wireless "last mile" broadband distribution system serving the communities of
**Rankin Inlet, Arviat and Chesterfield Inlet, Nunavut**. It defines the project's objectives,
scope, budget, schedule, organization and risks at a level sufficient for the sponsor to approve
the engagement and for NWI to mobilize engineering and procurement. On approval, this charter is
the reference document for all subsequent design, contracting and change-control activity.

## 2. Business Case

Rankin Inlet, Arviat and Chesterfield Inlet are underserved by affordable high-speed internet;
existing connectivity is limited to satellite feeds shared across a community. This is squarely
within NWI's mission: *"to supply complete or partial wireless internet access solutions... we
will engineer, manufacture, procure, install and commission these systems with proven
experience"* using low-cost, universally accepted 802.11 wireless technology. Distributing an
existing satellite internet feed over a local wireless last-mile network gives each community
affordable broadband at a fraction of the cost of new wired infrastructure, with fast deployment
and a design that can grow with demand.

A wireless last-mile build is materially cheaper and faster to deploy here than any wired
alternative, and reuses the satellite backhaul the communities already have — the project adds
local distribution only, not a new internet feed.

## 3. Project Objectives

1. Design, supply, install and commission a fixed wireless-802.11b last-mile network capable of
   serving an initial **50 subscribers** across the three communities.
2. Deliver the system within the mock planning budget of **$65,430 (NWI cost) / $85,059
   (customer price)** documented in `RankinMockCostEstimate.xlsx`.
3. Complete engineering through commissioning within the planning schedule in Section 7
   (~12–14 weeks end to end), subject to Arctic weather and freight windows.
4. Hand over a fully tested, documented network with trained local personnel and **two months of
   included remote/telephone support**, per the Scope of Supply.
5. Achieve subscriber connectivity and bandwidth-control performance consistent with the
   Equipment Description (per-plan speed tiers, MAC-based authentication, BCG bandwidth
   management).

## 4. Scope

### 4.1 In Scope (Deliverables — see Scope of Supply Summary for full detail)

| Work Package | Summary |
|---|---|
| Engineering & Admin | Site study & conceptual design, layout drawing & BOM, network design & configuration drawings, technical/training manual, procurement, project management/coordination |
| Base Station | Access point & cabinet, 2 radio cards, 2 antenna/amplifier chains, cabling & connectors, lightning/power protection |
| Wired Network | Bandwidth control gateway (hardware & software), main hub/switch, configuration, power protection |
| Premise Equipment | 50 modem/radio units, 50 patch antennas, RF and Ethernet cabling per subscriber |
| Installation & Commissioning | On-the-ground and installed on-site testing, safety climbing equipment, installation tools |
| Training | Training manual and a one-time 4-hour on-site training course for local personnel |
| Support | 24/7 technical support with two months of remote administration/telephone support included |

### 4.2 Out of Scope (Exclusions)

Per the Scope of Supply Summary, the following are explicitly **excluded** from this project and
remain the customer's responsibility unless separately contracted:

- Network Interface Cards (NIC) — available at $75/unit installed if needed
- A full tower or mast structure — NWI supplies a **bracket only** to mount antennas to an
  existing mast (rooftop or 60-ft ground tower can be quoted separately)
- Special ladders, cranes and safety equipment beyond standard climbing gear
- Climate-controlled equipment rooms and power source
- ISP services (email, web, messaging) — available at $10/month/customer
- Client VPN / secure transfer configuration and data encryption
- Spare parts inventory (recommended, not included)
- Emergency backup power for the base station and bandwidth control unit
- Firewalls (customer responsibility)
- Traffic/usage data collection
- Full network redundancy (not designed into this system)
- The RADIUS/Active Directory "Advanced Option" bandwidth-control integration described in the
  Equipment Description — this project delivers the **base** MAC-authentication/BCG model only

## 5. High-Level Budget

Full line-item detail is in `RankinMockCostEstimate.xlsx` (WBS-based, sourced from
`WBSWithEstimatesV1.xlsx`). Summary:

| Work Package | Our Cost | Customer Price | Profit |
|---|---:|---:|---:|
| Engineering & Admin | $13,000 | $16,900 | $3,900 |
| Base Station | $11,630 | $15,119 | $3,489 |
| Wired Network | $11,250 | $14,625 | $3,375 |
| Premise Equipment (x50) | $27,650 | $35,945 | $8,295 |
| Installation & Commissioning (supporting items) | $400 | $520 | $120 |
| Training | $200 | $260 | $60 |
| Support (2-month included period) | $1,300 | $1,690 | $390 |
| **Total** | **$65,430** | **$85,059** | **$19,629** |

Figures are mock/ballpark planning estimates (30% standard markup applied) and should be
validated against current vendor quotes and labor rates before use in a firm customer quote.

## 6. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Community/ISP Sponsor (Rankin Inlet, Arviat, Chesterfield Inlet) | Project Sponsor / Customer | Owns and operates the resulting network; funds the project |
| Jim Cox — President & CFO, NWI | Executive Sponsor (NWI) | Commercial approval, contract, funding of NWI resources |
| Stephane Gauvin — President, Engineering & Manufacturing, NWI | Engineering Sponsor | Technical design authority, equipment sourcing |
| NWI Project Manager | Project Manager | Day-to-day delivery, schedule, budget, risk, stakeholder communication |
| NWI Engineering Team | Delivery | Site study, network design, drawings, technical manual |
| NWI Installation/Commissioning Crew | Delivery | Base station, wired network and premise installation; on-site testing |
| Local Community Personnel | End Users / Trainee(s) | Receive service; local technician trained to administer the network |
| Subscribers (up to 50 initial) | End Users | Broadband service quality and reliability |
| Satellite Backhaul Provider (existing, e.g. RAM Telecom per Equipment Description) | External Dependency | Provides the internet feed the wireless network distributes — outside NWI's control |

## 7. Milestones & High-Level Schedule

Derived from the WBS standard delivery spans, sequenced for a remote Arctic deployment across
three communities (fly-in logistics and weather windows add buffer beyond the raw WBS figures;
this is a planning-level schedule, not a committed date range).

| Phase | Key Activities | Planning Duration |
|---|---|---|
| 1. Engineering & Design | Site visit, site study, layout/BOM, network design, technical manual, PM/procurement kickoff | ~2–3 weeks (incl. travel to sites) |
| 2. Procurement & Vendor Lead Time | Order base station, wired network and CPE hardware/software (longest single lead item: 21 days) | ~4–5 weeks (incl. freight buffer to fly-in communities), run largely in parallel with late engineering |
| 3. Installation — Base Station & Wired Network | Mount bracket/antennas, install AP/amplifier/BCG hardware, cable, power protection, startup/test | ~1 week per community |
| 4. Installation — Premise Equipment (x50) | Install & configure 50 subscriber modems/antennas (crew-based: ~2-person crew, ~5 installs/day) | ~2 weeks across the three communities |
| 5. Commissioning & Batch Testing | On-the-ground and installed on-site testing, bandwidth-control verification | ~1 week |
| 6. Training & Handover | 4-hour on-site training course, documentation handover, support activation | 1 day + ongoing 2-month included support |
| **Total (planning estimate)** | | **~12–14 weeks, engineering start to handover** |

## 8. Project Organization

- **Sponsor approval** rests with the Community/ISP Sponsor and NWI's President & CFO (Jim Cox).
- **Technical authority** rests with NWI's President, Engineering & Manufacturing (Stephane
  Gauvin), who signs off on the network design and equipment selection.
- **Delivery** is managed day-to-day by an NWI Project Manager, coordinating engineering,
  procurement and the installation/commissioning crew per the WBS.
- **Change control:** any change to scope, budget or schedule set out in this charter (including
  adoption of the RADIUS/Advanced Option bandwidth-control integration) requires a written change
  request approved by both the Sponsor and NWI's Executive/Engineering Sponsors before work
  proceeds.

## 9. Assumptions

- The satellite dish/router backhaul already exists at each community and is supplied and
  maintained outside this project.
- An existing mast, tower, water tower or rooftop is available at each base station location for
  bracket-mounting the antennas; no new tower/mast structure is required.
- A part-time local network administrator will be available post-handover, supported by NWI's
  two-month included remote/telephone support.
- Standard "off-the-shelf" 802.11b equipment, compliant with Canadian standards, is available
  within normal vendor lead times.
- Labor is costed at NWI's standard internal rate of $400/day ($50/hr).
- Community sites are accessible for freight and personnel within the assumed procurement and
  installation windows (fly-in access, no extended weather closures).

## 10. Constraints

- All three communities are fly-in/remote Arctic locations — freight, travel and weather windows
  materially affect schedule and are less predictable than a road-accessible site.
- Design targets a **50-to-1 user ratio per 500 kbps** and speeds from 0 Mbps up to 500 kbps,
  controlled by the bandwidth control gateway; capacity beyond this requires a design change.
- No system redundancy is designed into this network (per Scope of Supply Exclusions) — a single
  base station failure affects all subscribers on that link.
- Emergency backup power is out of scope; regional power outages will take the network down with
  the community grid.
- IPX/SPX (Netware) networks are not supported; only Ethernet/TCP/IP end-user equipment is
  compatible without additional adapters.

## 11. Risk Register

Standard PMI-aligned risk categories (technical, schedule, cost, external, organizational),
ranked by qualitative likelihood × impact.

| ID | Risk | Category | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | Freight/shipping delays to fly-in communities push out equipment delivery | Schedule/External | High | High | Order long-lead components first; build freight buffer into the schedule beyond vendor lead time; confirm sealift/air-freight windows before committing installation dates | NWI PM |
| R2 | Arctic weather prevents outdoor/tower work during the installation window | Schedule/External | High | Medium | Sequence outdoor tower/mast work for the most favorable weather window; hold indoor wired-network/BCG work as weather-flexible fallback | NWI Install Lead |
| R3 | No system redundancy — single base station failure takes down all subscribers on that link | Technical | Medium | High | Recommend customer purchase recommended spares (power supplies, radios, connectors, cable) per Scope of Supply guidance; document rapid-swap procedure in training | Engineering Sponsor |
| R4 | Existing satellite backhaul bandwidth/reliability is outside NWI's control and may not meet demand | External | Medium | High | Confirm backhaul capacity and SLA with the satellite provider before final network sizing; document as a dependency, not a deliverable | NWI PM |
| R5 | Community power outages take down base station/BCG (no backup power in scope) | External | Medium | Medium | Power outage protection and conditioning is included on all backbone equipment; recommend customer evaluate backup power separately | Engineering Sponsor |
| R6 | Vendor lead time slips beyond the 21-day standard for specialized electronics (AP, BCG hardware, router) | Schedule/Cost | Medium | Medium | Place orders for long-lead items immediately at project kickoff; identify a secondary vendor for critical components | NWI Procurement |
| R7 | Subscriber uptake is slower than the 50-unit plan, affecting the customer's revenue case | Organizational/Business | Medium | Medium | Design and premise-equipment procurement can phase in smaller batches; NWI's own experience (per the NWI Business Plan) shows uptake risk is best managed with an anchor-tenant base before broad residential rollout | Community Sponsor |
| R8 | Local technical labor/administrator availability is limited post-handover | Organizational | Medium | Medium | One-time 4-hour training course plus two months of included remote/telephone support; recommend the trainee shadow the commissioning crew hands-on | NWI PM |
| R9 | Scope creep toward the RADIUS/Active Directory "Advanced Option" not included in this charter | Scope | Low | Medium | Change-control process in Section 8; any advanced-option request is a formal change request with its own cost/schedule impact | NWI PM |
| R10 | Safety incident during mast/tower climbing work in cold-weather conditions | Health & Safety | Low | High | Dedicated safety climbing equipment line item in the estimate; certified climbers only; cold-weather safety procedures followed on every site visit | NWI Install Lead |
| R11 | Installation crew productivity assumption (2-person crew, ~5 premise installs/day) proves optimistic given travel time between subscribers | Schedule | Medium | Low | Track actual installs/day from day one and re-forecast the premise-equipment phase after the first week on-site | NWI PM |

## 12. Success Criteria

- All 50 initial subscriber connections installed, configured and verified against the base
  station within the commissioning phase.
- Bandwidth control gateway enforcing the designed speed tiers (50k/100k/150k) with MAC-based
  authentication functioning at the access point.
- Network, software and vendor documentation delivered in the technical manual; local personnel
  trained and able to perform basic administration.
- Two-month included support period activated at handover with no unresolved critical defects.
- Actual cost and schedule within an agreed tolerance of the budget and schedule in Sections 5
  and 7 (tolerance to be set with the Sponsor at project kickoff).

## 13. Charter Approval

| Name | Role | Signature | Date |
|---|---|---|---|
| Jim Cox | President & CFO, NWI | | |
| Stephane Gauvin | President, Engineering & Manufacturing, NWI | | |
| _[Community/ISP Sponsor representative]_ | Project Sponsor | | |

---

*Prepared by Northern Wireless Inc. — turnkey wireless internet solutions. Figures and schedule
are illustrative mock planning estimates based on `WBSWithEstimatesV1.xlsx` and the Rankin Scope
of Supply Summary; validate against current vendor quotes, labor rates and site conditions before
use in a firm customer commitment.*
