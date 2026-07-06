export const getRandomLetter = (): string => {

    const startCode = 97;
    const alphabetLength = 26;

    const randomCode = startCode + Math.floor(Math.random() * alphabetLength)

    return String.fromCharCode(randomCode)
}

