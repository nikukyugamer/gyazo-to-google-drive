import GyazoToGoogleDrive from './GyazoToGoogleDrive'

const maxPageNumber = process.argv[2] ? parseInt(process.argv[2], 10) || 1 : 1

new GyazoToGoogleDrive().main(maxPageNumber)
