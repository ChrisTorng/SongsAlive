export class Utils {
    public static padTo2Digits(number: number): string {
        if (number < 10) {
            return `0${number}`;
        }
        return number.toString();
    }
    
    public static padTo3Digits(number: number): string {
        if (number < 10) {
            return `00${number}`;
        }
        if (number < 100) {
            return `0${number}`;
        }
        return number.toString();
    }

    public static rightPadTo2Digits(number: number): string {
        if (number % 1 === 0) {
            return `${number}.00`;
        }

        if ((number * 10) % 1 === 0) {
            return `${number}0`;
        }

        return (Math.round(number * 100) / 100).toFixed(2);
    }
    
    public static rightPadTo3Digits(number: number): string {
        if (number % 1 === 0) {
            return `${number}.000`;
        }

        if ((number * 10) % 1 === 0) {
            return `${number}00`
        }

        if ((number * 100) % 1 === 0) {
            return `${number}0`;
        }

        return (Math.round(number * 1000) / 1000).toFixed(3);
    }

    public static formatDuration(duration: number): string {
        const milliseconds = Math.round(duration * 1000);
        const totalSeconds = Math.floor(milliseconds / 1000);
        const fraction = this.trimFraction((milliseconds % 1000).toString().padStart(3, '0'));
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);

        if (hours > 0) {
            return `${hours}:${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}.${fraction}`;
        }

        if (totalSeconds >= 60) {
            return `${Math.floor(totalSeconds / 60)}:${this.padTo2Digits(seconds)}.${fraction}`;
        }

        return `${seconds}.${fraction}`;
    }

    public static formatDurationForPosition(duration: number): string {
        const totalSeconds = Math.floor(duration);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);

        if (hours > 0) {
            return `${hours}:${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`;
        }

        if (totalSeconds >= 60) {
            return `${Math.floor(totalSeconds / 60)}:${this.padTo2Digits(seconds)}`;
        }

        return seconds.toString();
    }

    private static trimFraction(fraction: string): string {
        return fraction.replace(/0+$/, '') || '0';
    }

    public static roundTo3Digits(number: number): number {
        return parseFloat(number.toFixed(3));
    }
}
