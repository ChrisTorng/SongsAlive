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

    public static roundTo3Digits(number: number): number {
        return parseFloat(number.toFixed(3));
    }
}