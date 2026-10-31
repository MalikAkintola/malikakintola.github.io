---
title: Mortgage Portfolio Risk
summary: A risk score for every loan in a four-year mortgage portfolio, built in DAX from credit score, loan-to-value and loan-to-income, then used to find where the risk sits and who writes it.
discipline: Risk analytics
year: 2025
featured: true
order: 3
finding: 18 of 19
findingNote: High-risk loans in the portfolio that were written by one office, Newark.
tools: [Power BI, DAX, Power Query, Excel]
cover: ./offices.webp
coverAlt: The Offices page of the mortgage report, with loans, high-risk and moderate-risk counts, and total loan cost for each office.
coverPosition: 62% 20%
gallery:
  - src: ./clusters.webp
    alt: A scatter chart of loan-to-income against credit score, coloured by three risk clusters.
    caption: Borrowers fall into three clusters by loan-to-income and credit score.
  - src: ./consultants.webp
    alt: A table of loan consultants with their number of loans, total loan cost and average cost per loan.
    caption: Consultant performance by total loan cost.
dashboard: https://app.powerbi.com/view?r=eyJrIjoiZjNlZjFkNTQtY2M4YS00MTk4LWFkNjItMTA5MDU3YThkZmUxIiwidCI6ImRlMTM3ZmFmLTVmMDQtNDI1OC04ZjRmLTdhNDg0NDNiM2JiZCIsImMiOjZ9
article: https://medium.com/@malikola223/portfolio-risk-assessment-for-conceptual-mortgage-bank-2017-2020-6d249b99ecec
---

## The question

A mortgage bank wanted to know how its loan costs are distributed, whether its risk clusters, how its
loan consultants perform, and which borrower characteristics go with high-risk loans, across
2017 to 2020.

## The data and the model

The data came in several Excel sheets covering five dimensions, with every transaction feeding one fact
table. I cleaned it, modelled it as a star schema, and derived loan-to-value and loan-to-income for each
loan. Then I combined them with the credit score into one risk score, each part scaled to 0–10:

```dax
Risk Score =
VAR normcreditscore = (([Total Credit Score] - 300) / (850 - 300)) * 10
VAR normLTI = (([Loan-to-income] - 0) / (25 - 0)) * 10
VAR normLTV = (([Loan to Value (LTV)] - 0) / (2.5 - 0)) * 10
VAR finalriskscore = (0.40 * normLTI) + (0.4 * normLTV) + (0.2 * normcreditscore)
RETURN finalriskscore
```

The score sorts every loan into low, medium or high risk, and a cluster analysis groups borrowers by
the same factors.

## What I found

- Most mortgages sit between $100K and $200K.
- Total loan cost grew 236.44% from 2017 to 2018, because more loans were issued, not larger ones.
- High-risk loans doubled in 2019, yet total loan cost fell only 10%: volume drives cost more than risk.
- Newark wrote 18 of the portfolio’s 19 high-risk loans and has the highest total loan cost. Its
  borrowers take large loans of $300K to $500K on the strength of high credit scores.
- Wilmington and Baltimore wrote no high-risk loans at all.
- The top consultant by loan cost, based in Newark, writes high- and medium-risk loans. The consultant
  in Wilmington writes only low and medium risk and ranks second lowest.

## What I recommended

Stricter credit assessment for Newark applicants, a loan-to-income cap for high-risk applicants with
good credit scores, interest rates priced by each city’s risk, and coaching that brings the two
consultants’ approaches closer together.
