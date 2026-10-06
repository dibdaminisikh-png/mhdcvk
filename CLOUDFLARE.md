# اتصال GitHub به Cloudflare Pages

سایت استاتیک است و به نصب وابستگی یا build احتیاج ندارد.

در حساب Cloudflare:

1. به Workers & Pages بروید و یک پروژه Pages با گزینه Import an existing Git repository بسازید.
2. GitHub را متصل کنید و فقط به مخزن خصوصی `mhdcvk` دسترسی بدهید.
3. Framework preset: None
4. Production branch: main
5. Build command: خالی
6. Build output directory: dist
7. پروژه را منتشر کنید و سپس از Custom domains دامنه موجود را اضافه کنید.

برای این روش Cloudflare API Token یا GitHub Actions لازم نیست. کلیدها را داخل فایل پروژه، چت یا مخزن قرار ندهید. پس از اتصال، هر push به main انتشار خودکار را آغاز می‌کند.

نام دامنه و اتصال حساب Cloudflare هنوز دریافت نشده‌اند؛ ساخت مخزن به‌تنهایی سایت را منتشر نمی‌کند.
