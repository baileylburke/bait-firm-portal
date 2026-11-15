// A BAIT build identified by its version
class Release {
  constructor({ version, releaseDate, notes, returnTypesAdded = [], downloadFile }) {
    this.version = version;
    this.releaseDate = releaseDate;
    this.notes = notes;
    this.returnTypesAdded = returnTypesAdded;
    this.downloadFile = downloadFile;
  }

  // Check for newly supported return types
  addsReturnTypes() {
    return this.returnTypesAdded.length > 0;
  }
}

module.exports = Release;
