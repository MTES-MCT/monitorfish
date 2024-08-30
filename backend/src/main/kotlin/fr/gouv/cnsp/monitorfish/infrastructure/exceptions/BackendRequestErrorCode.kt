package fr.gouv.cnsp.monitorfish.infrastructure.exceptions

/**
 * Infrastructure error code thrown when the request is invalid.
 *
 * It's most likely a Frontend bug. But it may also be a Backend bug.
 *
 * ## Examples
 * - Request data inconsistency that can't be type-checked with a `DataInput` and throws deeper in the code.
 *
 * ## ⚠️ Important
 * **Don't forget to mirror any update here in the corresponding Frontend enum.**
 */
enum class BackendRequestErrorCode {
    MISSING_UPLOADED_FILE_NAME,
    MISSING_UPLOADED_FILE_TYPE,
    WRONG_BODY_PARAMETER_TYPE,
}
