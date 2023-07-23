const puppeteer = require('puppeteer');

// 测试函数
async function test() {
    try {
        const url = 'https://overwatch.blizzard.com/en-us/career/darkgenernal-3501/'; // 替换成你要访问的网页 URL

        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();

        // 访问网页
        await page.goto(url, {timeout: 180000});

        // 等待一定时间（可选）
        await page.waitForTimeout(5000); // 在此示例中，等待 5 秒钟

        // 关闭浏览器实例
        await browser.close();

        console.log('网页访问成功！');
    } catch (error) {
        console.error('Error:', error);
    }
}

// 执行测试函数
test();
