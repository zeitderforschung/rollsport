# 🛼 Rollkunstlauf Ranking Calculator

Calculate competition rankings using the official DRIV Majoritätssystem.

**➡️ Visit: [https://rollkunstlauf.party](https://rollkunstlauf.party)**

## 🤔 Why Rankings Aren't Just Added Up

In artistic roller skating competitions, rankings work differently than you might expect. The final placement isn't simply the sum of all scores. Instead, the **Majoritätssystem (Majority System)** compares each skater against every other skater, judge by judge.

**💡 Example:** Even if a skater has the highest total score from one judge, they may not place first overall if the majority of judges ranked another skater higher in direct comparisons.

## ⚙️ How It Works

1. Each skater receives an **A-Note** (technical) and **B-Note** (artistic) from each judge
2. For every pair of skaters, each judge determines who performed better
3. The skater who wins the majority of judges in that comparison gets one "majority victory"
4. Final rankings are based on total majority victories

This system ensures that the majority opinion of judges determines the results, even when individual judges score very differently.

**📖 Want to understand the math?** See the detailed algorithm explanation in [SCORING.md](SCORING.md).

## References

- [DRIV Wertungskriterien Einzellaufen Kür 10,0 (2025)](https://www.rollkunstlauf-driv.de/fileadmin/rollkunstlauf-driv/documente/regelwerk/Wertungskriterien/2025_01_DRIV_Wertungskriterien_Einzellaufen_Kuer.pdf)
- [Rollkunstlauf - Von den Noten zu den Plätzen](https://rollsport-potsdam.de/file/repository/VondenNotenzudenPltzen.pdf) by Rainer Kayser
