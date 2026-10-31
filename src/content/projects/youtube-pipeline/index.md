---
title: YouTube Analytics Pipeline
summary: An automated pipeline that collects video and channel statistics for six YouTube channels, models them, and serves a Power BI report that refreshes itself in Microsoft Fabric.
discipline: Data engineering
year: 2025
featured: true
order: 1
finding: 6 channels
findingNote: Scraped, modelled and compared through the YouTube API, and refreshing on its own in Microsoft Fabric.
tools: [Python, YouTube Data API, MySQL, Microsoft Fabric, Data Factory, Lakehouse, Power BI]
cover: ./mrbeast.webp
coverAlt: The MrBeast page of the YouTube report, with subscriber, view and like totals, the most engaging videos and a views trend.
coverPosition: 18% 40%
gallery:
  - src: ./home.webp
    alt: The report’s home page, with links to the channel pages and the Face-Off Arena.
    caption: The home page leads to one page per channel or to the comparison.
  - src: ./mrwhosetheboss.webp
    alt: The Mrwhosetheboss channel page, with totals, top videos by engagement and a monthly views chart.
    caption: Each channel page shows growth, the most and least engaging videos, and how posting frequency relates to engagement.
  - src: ./face-off.webp
    alt: The Face-Off Arena page, where two channels are chosen from two lists.
    caption: The Face-Off Arena puts any two channels side by side.
dashboard: https://app.powerbi.com/view?r=eyJrIjoiYWNhMDAwMWItNzBkYy00MWE4LThiMDEtY2FhZTNlYjE1Nzk3IiwidCI6ImRlMTM3ZmFmLTVmMDQtNDI1OC04ZjRmLTdhNDg0NDNiM2JiZCIsImMiOjZ9
article: https://medium.com/@malikola223/an-end-to-end-data-analytics-project-on-my-favorite-youtube-channels-15c400d3a081
repo: https://github.com/MalikAkintola/Youtube-Channel-Analytics
---

## The question

My younger brother asked how many likes MrBeast had collected across his whole channel. Answering that
properly means collecting every video, not reading one total, so I built it for six channels instead of
one.

## Collecting the data

A Python script calls the YouTube Data API for each channel and collects every video’s ID, publish
date, title, category, duration, views, likes, favourites and comments, along with each channel’s
subscriber count. Video records land in MySQL, subscriber counts in a CSV file, and the category names
come from a web source.

The API has strict daily quotas, so the script batches its requests to stay under them. Indexes on the
MySQL tables keep the report quick as the history grows.

## Shaping it for analysis

YouTube returns durations in ISO 8601 and timestamps in mixed formats. I converted durations to
seconds, normalised the dates, handled missing values, and added an engagement rate:

```text
engagement rate = (likes + comments) / views
```

## Moving it to Microsoft Fabric

The first version refreshed through an on-premises data gateway, which meant my laptop had to be on. I
ported the whole pipeline to Microsoft Fabric. Data Factory runs the extraction on a schedule, the data
lands in a Lakehouse with incremental loads, and the report refreshes from it in the Power BI Service.
It has run end to end in the cloud ever since, with no local machine involved.

## The report

The home page leads to a page for each channel and to the Face-Off Arena. A channel page shows how the
channel has grown, its most and least engaging videos, and how often it posts against how well those
videos do. The Face-Off Arena lets you pick any two channels and compare likes per video, subscriber
growth and engagement side by side.
