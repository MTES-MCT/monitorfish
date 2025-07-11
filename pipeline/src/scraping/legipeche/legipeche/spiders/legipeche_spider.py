import scrapy


class LegipecheSpider(scrapy.Spider):
    name = "legipeche"
    start_urls = [
        "http://legipeche.metier.e2.rie.gouv.fr/bibliotheque-r3.html",
    ]

    def parse(self, response):
        #####################################################
        # Extract data from the page, if it is an article page
        title = response.xpath('//main[@id="main"]/article/header/h1/text()').get()

        if title:
            downloadable_items = response.xpath('//ul[@class="download-list"]/li/a')

            if downloadable_items:
                # When the article contains downloadable documents
                for item in downloadable_items:
                    yield {
                        "page_title": title,
                        "page_url": response.url,
                        "document_title": "".join(
                            item.xpath("span/text()").getall()[:2]
                        ),
                        "document_url": response.urljoin(item.xpath("@href").get()),
                    }
            else:
                # When the article contains no downloadable documents
                yield {
                    "page_title": title,
                    "page_url": response.url,
                    "document_title": None,
                    "document_url": None,
                }

        ##############
        # Follow links
        for href in response.xpath(
            '//div[@class="articles-list__item__content _content"]/a/@href'
        ):
            yield response.follow(href, callback=self.parse)

        for href in response.xpath(
            '//div[@class="rubrique__list__item"]/ul/li/a/@href'
        ):
            yield response.follow(href, callback=self.parse)

        for href in response.xpath('//div[@class="rubrique__list__item"]/h2/a/@href'):
            yield response.follow(href, callback=self.parse)

        for href in response.xpath('//nav[@class="pagination"]/ul/li/a/@href'):
            yield response.follow(href, callback=self.parse)
