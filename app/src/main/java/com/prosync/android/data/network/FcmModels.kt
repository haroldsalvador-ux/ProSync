package com.prosync.android.data.network

data class FcmV1Payload(
    val message: FcmV1Message
)

data class FcmV1Message(
    val token: String,
    val notification: FcmNotification
)

data class FcmNotification(
    val title: String,
    val body: String
)

data class FcmPayload(
    val to: String,
    val notification: FcmNotification
)
