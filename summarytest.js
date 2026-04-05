const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const SummaryBot = require('summarybot')
const summarizer = new SummaryBot()

function removeHTML(html) {
	const $ = cheerio.load(html);
	$('script').remove();
	$('style').remove();
	let text = $.text();
	text = text.replace(/\s+/g, ' ').trim();
	return text;
}

async function delay(time) {
	return new Promise(function(resolve) {
		setTimeout(resolve, time)
	});
}

async function scrape(url) {
	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();
	await page.goto(url);
	//wait for 2 seconds
	await delay(2000);
	const content = await page.content();
	await browser.close();
	return content;
}

//anonymous async function
(async () => {
	//get the html of the page
	const html = await scrape("https://www.rottentomatoes.com/m/hypnotic_2023");
	//remove the html tags
	const text = removeHTML(html);
	//summarize the text
	const summary = summarizer.run(text, 5, false);
	//print the summary
	console.log(text);
})();

//console.log(summarizer.run(removeHTML(scrape), 5, false))