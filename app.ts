import GyazoToGoogleDrive from './GyazoToGoogleDrive'

const maxPage = process.argv[2] ? parseInt(process.argv[2], 10) || 100 : 100;

new GyazoToGoogleDrive().main(maxPage)
