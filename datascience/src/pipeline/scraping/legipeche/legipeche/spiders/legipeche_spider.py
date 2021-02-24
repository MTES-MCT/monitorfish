import scrapy


class LegipecheSpider(scrapy.Spider):
    name = "legipeche"
    start_urls = [
        "http://legipeche.metier.i2/bibliotheque-r3.html",
    ]

    def parse(self, response):
        items = response.xpath(
            '//div[@class="articles-list__item__content _content"]/a'
        )
        location_menu = response.xpath(
            '//div[@id="site-content"]/ul[@class="breadcrumb"]/li'
        )
        location = "/".join(location_menu.xpath("a/text()").getall())
        location += "/" + location_menu.xpath("text()")[-1].get().strip(" >\t\n")

        for item in items:
            title = item.xpath("@title").get()
            url = response.urljoin(item.xpath("@href").get())
            yield {
                "scraped_from": response.url,
                "location": location,
                "title": title,
                "url": url,
            }

        for href in response.xpath(
            '//div[@class="rubrique__list__item"]/ul/li/a/@href'
        ):
            yield response.follow(href, callback=self.parse)

        for href in response.xpath('//div[@class="rubrique__list__item"]/h2/a/@href'):
            yield response.follow(href, callback=self.parse)

        for href in response.xpath('//nav[@class="pagination"]/ul/li/a/@href'):
            yield response.follow(href, callback=self.parse)
