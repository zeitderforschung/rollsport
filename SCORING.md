# Ranking Computation - Majoritätssystem (Majority System)

## Overview

This document describes the exact algorithm for computing rankings in figure skating competitions according to the DRIV (Deutscher Rollsport- und Inline-Verband) regulations, specifically for Freiläufer (Free Skaters) and Figurenläufer (Figure Skaters).

The ranking system is based on the **Majoritätssystem (Majority System)**, where rankings are determined not simply by the sum of scores, but through pairwise comparisons between skaters across all judges.

## Reference Documents

This document is based on:
- [DRIV Wertungskriterien Einzellaufen Kür 10,0](https://www.rollkunstlauf-driv.de/fileadmin/rollkunstlauf-driv/documente/regelwerk/Wertungskriterien/2025_01_DRIV_Wertungskriterien_Einzellaufen_Kuer.pdf) (Stand: 01/2025)
- [Rollkunstlauf - Von den Noten zu den Plätzen](https://rollsport-potsdam.de/file/repository/VondenNotenzudenPltzen.pdf) by Rainer Kayser

## Scoring Components

Each skater receives two types of scores from each judge:

### A-Note (Technical Score)
Evaluates the technical elements:
- **Sprünge (Jumps)**: Difficulty, execution quality, rotation completeness
- **Pirouetten (Spins)**: Difficulty, position quality, rotation speed and count
- **Läuferisches Vermögen (Skating Skills)**: Flow, edge quality, footwork

### B-Note (Artistic Score)
Evaluates the artistic components:
- **Choreographie (Choreography)**: Originality, spatial and temporal structure
- **Ausdruck & Interpretation (Expression & Interpretation)**: Music interpretation, performance quality
- **Verbindungen/Transitions**: Quality of connections between technical elements

## Judge Score Processing

For each judge, the total score for a skater is calculated as the sum of their A-Score and B-Score. This total is calculated for each individual judge and is used in all pairwise comparisons.

## Ranking Algorithm

The ranking is determined through a multi-level process:

### Level 1: Majority Victories (M.V. / Verhältniszahl)

**Process:**
1. Every skater is compared with every other skater in pairwise comparisons
2. For each pair of skaters, each judge's scores are compared:
   - Compare the total scores (A + B) for that judge
   - If totals are equal, compare the B-scores
   - Award the comparison to the skater with the higher score
   - If both total and B-score are equal for a judge, it's a tie (0.5 points each)

3. For each pairwise comparison:
   - If a skater wins the majority of judges, they get 1 victory point
   - If there's an exact tie (equal number of judges for each), both get 0.5 victory points

4. The skater with the most majority victories ranks highest

**Example:**

Skater 1 receives judge totals of 3.5, 3.7, and 3.4 from three judges.
Skater 2 receives judge totals of 3.6, 3.6, and 3.5 from the same judges.

Comparison:

- Judge 1: 3.5 < 3.6 → Skater 2 wins
- Judge 2: 3.7 > 3.6 → Skater 1 wins
- Judge 3: 3.4 < 3.5 → Skater 2 wins

Result: Skater 2 wins the majority (2 judges to 1) → Skater 2 gets +1 M.V.

### Level 2: Tie-Breaking Rules

When two or more skaters have the same number of majority victories, the following tie-breaking rules are applied **in order**:

#### Tie-Break 1: Direct Comparison (Vergleichszahl)

- Only the tied skaters are compared with each other
- For each pairwise comparison between tied skaters:
  - Count the number of judges who favored each skater
  - Award points: 1 point per judge victory, 0.5 points for ties
- Sum these comparison points for each tied skater
- The skater with the highest sum ranks higher

**Example:**

Three skaters are tied with M.V. = 5

Direct comparisons between the tied skaters:

- Skater A vs Skater B: A gets 2 judges, B gets 1 → A: +2, B: +1
- Skater A vs Skater C: A gets 1 judge, C gets 2 → A: +1, C: +2
- Skater B vs Skater C: B gets 3 judges, C gets 0 → B: +3, C: +0

Total comparison scores:

- Skater A: 2 + 1 = 3
- Skater B: 1 + 3 = 4
- Skater C: 2 + 0 = 2

Ranking: B > A > C

#### Tie-Break 2: Sum of B-Scores

If direct comparison scores are still equal:
- Sum all individual B-scores from all judges (not the trimmed mean)
- The skater with the higher sum of B-scores ranks higher

**Note:** This uses the raw B-scores from each judge, not the processed trimmed mean.

#### Tie-Break 3: Comparison with ALL Skaters (Vergleichszahl mit allen Läufern)

If B-score sums are still equal:
- Compare each tied skater with **every skater in the competition** (not just the tied ones)
- For each tied skater, sum up all their pairwise comparison scores against all other skaters
- The skater with the highest total comparison score ranks higher

**This is a key difference:** While Tie-Break 1 only compares tied skaters among themselves, Tie-Break 3 includes all skaters in the competition.

#### Tie-Break 4: Total Score (Gesamtpunktzahl)

If all previous criteria are equal:
- Compare the total scores (trimmed mean A-score + trimmed mean B-score)
- The skater with the higher total score ranks higher

#### Final: Tied Ranking

If all criteria including total scores are identical:
- The skaters remain tied and share the same rank

## Implementation Details

### Pairwise Comparison Logic

When comparing two skaters for a single judge:

1. If one skater's total is higher, they win (1 point)
2. If totals are equal, compare B-scores
3. If B-scores are also equal, it's a tie (0.5 points each)

### Handling Missing Scores

- Missing or null scores are filtered out before calculations
- Only valid scores are used in trimmed mean calculations
- If all scores are missing, the score is treated as 0

### Rounding

All displayed scores are rounded to 1 decimal place.

## Important Principles

### 1. Majority Over Sum
Rankings are **not** determined by the sum of A and B scores directly. The majority system ensures that the opinion of the majority of judges is respected, even if one judge gives significantly different scores.

### 2. Quality of Performance
The system rewards consistent performance across all judges. A skater who is ranked higher by most judges will rank better overall, even if their total score might be lower.

### 3. B-Score as Tie-Breaker
The artistic score (B-Note) serves as an important tie-breaker, reflecting the importance of artistic impression when technical abilities are similar.

### 4. Progressive Tie-Breaking
The tie-breaking system becomes progressively more detailed:
1. Direct comparison (only tied skaters)
2. Artistic scores
3. Comprehensive comparison (all skaters)
4. Total scores
5. Tied ranking

This ensures fairness while minimizing the likelihood of shared placements.

## Practical Application

### For Competitors and Parents

When watching a competition:
1. Record both A and B scores from each judge for each skater
2. Calculate the total (A + B) for each judge
3. For quick estimates, count "majority victories" by comparing skaters pairwise
4. Remember: The skater with the most wins in pairwise comparisons usually ranks highest
5. Don't rely solely on total score sums - they may not reflect the final ranking!

### For Judges

- Ensure consistency in your judging criteria
- Remember that your scores will be compared both individually and as part of the trimmed mean
- The B-score becomes important in tie-breaking situations
- Both relative ranking and absolute scores matter

### For Organizers

- Use proper scoring software that implements the Majoritätssystem correctly
- Display M.V. (Majority Victories) in results to help understanding
- Be prepared to explain tie-breaking results when they occur
- Ensure all judges understand the system's impact on their scoring

## Example Scenario

**Competition with 3 judges and 4 skaters:**

| Skater | Judge 1 (A+B) | Judge 2 (A+B) | Judge 3 (A+B) | M.V. |
|--------|---------------|---------------|---------------|------|
| Anna   | 7.8           | 7.9           | 8.1           | 3    |
| Ben    | 8.0           | 7.7           | 7.8           | 2    |
| Clara  | 7.5           | 8.0           | 7.9           | 1    |
| David  | 7.4           | 7.6           | 7.5           | 0    |

**Pairwise Comparisons:**
- Anna vs Ben: Anna wins (Judge 2: 7.9 > 7.7, Judge 3: 8.1 > 7.8) → Anna +1 M.V.
- Anna vs Clara: Anna wins (Judge 1: 7.8 > 7.5) → Anna +1 M.V.
- Anna vs David: Anna wins (all judges) → Anna +1 M.V.
- Ben vs Clara: Ben wins (Judge 1: 8.0 > 7.5) → Ben +1 M.V.
- Ben vs David: Ben wins (all judges) → Ben +1 M.V.
- Clara vs David: Clara wins (all judges) → Clara +1 M.V.

**Final Ranking:**
1. Anna (3 M.V.)
2. Ben (2 M.V.)
3. Clara (1 M.V.)
4. David (0 M.V.)

Note: Even though Ben has the highest total from Judge 1 (8.0), Anna ranks first because she won the majority of judges in their direct comparison.

## References

- DRIV Wettkampfordnung Rollkunstlauf (WOK)
- Rainer Kayser: ["Rollkunstlauf - Von den Noten zu den Plätzen"](https://rollsport-potsdam.de/file/repository/VondenNotenzudenPltzen.pdf)
- DRIV: [Wertungskriterien Einzellaufen Kür 10,0 (2025)](https://www.rollkunstlauf-driv.de/fileadmin/rollkunstlauf-driv/documente/regelwerk/Wertungskriterien/2025_01_DRIV_Wertungskriterien_Einzellaufen_Kuer.pdf)
