class Utilities {
    public static readonly EMPTY_STRING: string = "";
    public static readonly SPACE: string = " ";
    public static readonly HYPHEN: string = "-";
    public static readonly PERIOD: string = ".";

    public static async getResponseDocument(href: string, retry: boolean = true): Promise<Document> {
        const response: Response = await this.getResponse(href, retry);
        let returnedDocument: Document = null;
        if (response !== null) {
            const text: string = await response.text();
            returnedDocument = new DOMParser().parseFromString(text, "text/html");
            const base: HTMLBaseElement = document.createElement("base");
            base.href = href;
            returnedDocument.head.appendChild(base);
        }

        return returnedDocument;
    }

    private static async getResponse(href: string, retry: boolean, failedHref: { href: string, waitTime: number } = {
        href: Utilities.EMPTY_STRING,
        waitTime: 1000
    }): Promise<Response> {
        const response: Response = await fetch(href);
        let returnedResponse: Response = null;
        const statusOk: number = 200;
        if (response.status === statusOk) { // the base case, the response was successful
            returnedResponse = response;
        } else if (retry) {
            failedHref.waitTime += this.randomNumber(0, 1000); // the base wait time is between one and two seconds
            if (failedHref.href === href) { // the request has previously failed
                failedHref.waitTime *= this.randomNumber(2, 3); // double the wait time (on average) for each failed attempt
            }
            failedHref.href = href; // save the failed request
            await this.waitFor(failedHref.waitTime);
            returnedResponse = await this.getResponse(href, true, failedHref);
        }

        return returnedResponse;
    }

    public static randomNumber(start: number, end: number): number {
        return Math.floor(start + Math.random() * (end - start));
    }

    public static async waitFor(milliseconds: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    public static getLastReadChapter(previous: { name: string, lastRead: number }, current: { name: string, lastRead: number }): { name: string, lastRead: number } {
        let returnedChapter: { name: string, lastRead: number };
        if (previous.lastRead > current.lastRead) {
            returnedChapter = previous;
        } else {
            returnedChapter = current;
        }

        return returnedChapter;
    }

    public static async onImageLoadError(image: HTMLImageElement): Promise<void> {
        // reload the image in 5 seconds
        await this.waitFor(this.randomNumber(5000, 10000));
        let imageSrc: string = image.src;
        const timePart = "?time=";
        const timeIndex: number = imageSrc.indexOf(timePart);
        const time: string = timePart + Date.now();
        if (timeIndex === -1) {
            imageSrc += time;
        } else {
            imageSrc = imageSrc.substring(0, timeIndex) + time;
        }
        image.src = imageSrc;
    }

    public static createTagWithClassName(tagName: string, className: string): HTMLElement {
        const createdElement: HTMLElement = document.createElement(tagName);
        createdElement.className = className;

        return createdElement;
    }

    public static createTagWithId(tagName: string, id: string): HTMLElement {
        const createdElement: HTMLElement = document.createElement(tagName);
        createdElement.id = id;

        return createdElement;
    }

    public static getCurrentTime(time: number): string {
        let currentTime: string;
        const secondsPerMinute: number = 60;
        const minutesPerHour: number = 60;
        if (time < secondsPerMinute) {
            currentTime = "00:" + parseInt(time + "");
        } else if (time < (secondsPerMinute * minutesPerHour)) {
            const minutes: number = parseInt((time / secondsPerMinute) + "");
            const seconds: number = parseInt(time % secondsPerMinute + "");
            currentTime = minutes + ":" + seconds;
        } else {
            const hours: number = parseInt((time / (secondsPerMinute * minutesPerHour)) + "");
            const minutes: number = parseInt((time / secondsPerMinute) + "") % minutesPerHour;
            const seconds: number = parseInt(time % secondsPerMinute + "");
            currentTime = hours + ":" + minutes + ":" + seconds;
        }

        // currentTime is of the format 1:2:3 and should be 01:02:03
        const parts = currentTime.split(":");
        let formattedTime = "";
        for (let i = 0; i < parts.length; i++) {
            let section = parts[i];
            if (section.length === 1) {
                section = "0" + section;
            }
            if (i < parts.length - 1) {
                formattedTime += section + ":";
            } else {
                formattedTime += section;
            }
        }

        return formattedTime;
    }

    public static hyphenateLongWord(chapterName: string): string {
        let hyphenatedChapterName: string = Utilities.EMPTY_STRING;
        const maxWordLength = 9;
        for (const word of chapterName.split(Utilities.SPACE)) {
            if (word.length > maxWordLength + 1) {
                hyphenatedChapterName += word.substring(0, maxWordLength) + Utilities.HYPHEN + Utilities.SPACE + word.substring(maxWordLength) + Utilities.SPACE;
            } else {
                hyphenatedChapterName += word + Utilities.SPACE;
            }
        }

        return hyphenatedChapterName;
    }

    public static getTimeAgo(unixTime: string): string {
        const now: number = Date.now();
        const before: number = parseInt(unixTime);
        const difference: number = (now - before) / 1000; // unix time is in milliseconds

        const secondsPerSeconds: number = 1;
        const secondsPerMinute: number = 60;
        const minutesPerHour: number = 60;
        const hoursPerWeek: number = 24;
        const daysPerWeek: number = 7;
        const weeksPerMonth: number = 4;
        const monthsPerYear: number = 12;

        let timeAgo: string = null;
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerSeconds, " second ago", " seconds ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute, " minute ago", " minutes ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour, " hour ago", " hours ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek, " day ago", " days ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek, " week ago", " weeks ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth, " month ago", " months ago");
        timeAgo = this.modifyTimeAgo(timeAgo, difference, secondsPerMinute * minutesPerHour * hoursPerWeek * daysPerWeek * weeksPerMonth * monthsPerYear, " year ago", " years ago");
        return timeAgo;
    }

    private static modifyTimeAgo(timeAgo: string, difference: number, factor: number, singular: string, plural: string): string {
        let returnedTimeAgo: string = timeAgo;
        if (difference > factor || factor === 1) {
            const time: number = Math.floor(difference / factor);
            if (time === 1) {
                returnedTimeAgo = time + singular;
            } else {
                returnedTimeAgo = Math.floor(difference / factor) + plural;
            }
        }
        return returnedTimeAgo;
    }

    public static updateLastRead(lastRead: HTMLSpanElement): void {
        const lastReadString: string = localStorage.getItem(lastRead.id);
        let lastReadInnerText: string;
        if (lastReadString === null) {
            lastReadInnerText = "Never read";
        } else {
            lastReadInnerText = Utilities.getTimeAgo(lastReadString);
        }
        lastRead.innerText = lastReadInnerText;
    }

}

