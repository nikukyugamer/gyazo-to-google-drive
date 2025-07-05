import GyazoToGoogleDrive from './GyazoToGoogleDrive'

const parsedPage = parseInt(process.argv[2], 10);
const startPage = process.argv[2] ? (isNaN(parsedPage) ? 1 : parsedPage) : 1;

new GyazoToGoogleDrive().main(startPage)
