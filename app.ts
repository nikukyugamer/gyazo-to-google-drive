import GyazoToGoogleDrive from './GyazoToGoogleDrive'

const startPage = process.argv[2] ? parseInt(process.argv[2], 10) : 1

new GyazoToGoogleDrive().main(startPage)
