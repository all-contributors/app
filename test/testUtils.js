const rejectionOf = promise =>
    promise.then(
        value => {
            throw value
        },
        reason => reason,
    )

module.exports = {
    rejectionOf,
}
