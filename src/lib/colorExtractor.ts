import ColorThief from "../../../node_modules/colorthief/dist/color-thief.mjs"; // your node modules path

export async function extractColors(imageUrl: string) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    return new Promise<{ vibrant: string; muted: string }>((resolve) => {
        img.onload = () => {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(img, 5);

            const vibrant = rgbToHex(palette[0]);
            const muted = rgbToHex(palette[palette.length - 1]);

            resolve({ vibrant, muted });
        };
    });
}

function rgbToHex([r, g, b]: number[]): string {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
}
