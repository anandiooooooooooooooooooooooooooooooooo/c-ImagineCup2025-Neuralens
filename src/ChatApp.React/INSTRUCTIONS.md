# Creative Writing Assistant

Enter into the chat what kind of article should be writte.  
To ensure that it is grounded on real public and also your internal product data, please provide additional context.

## Sample

> Current limitation: Needs to be strict this format and with streaming enabled

``` yaml
research: Can you find the camping trends in 2024 and what folks are doing in this winter?  
products: Can you use a selection of tents and sleeping bags as context?  
writing:  Write a fun and engaging article that includes the research and product information. The article should be between 400 and 600 words.
```

## Research Agent

*What kinds of things should I find?*

This agent uses your context / question, formulates out of that expert queries and uses Bing search to get results for them.  
After that the findings are summarized.

## Marketing Agent

*What products should I look at?*

This agent uses your context / question, formulates out of that up to 5 specialized queries and uses a internal Vector store to find matching products with semantic search.  
After that the findings are summarized.

## Writer Agent

*What kind of writing should I do?*

This agent uses your instructions, the other contexts and the research and marketing results to produce an article.  
If it gets feedback for rework, it will do so.

## Editor Agent

Reviews the outcomes from the writer agent and provides feedback to it.  
This agent also decides when the article is accepted and no further rework necessary.
