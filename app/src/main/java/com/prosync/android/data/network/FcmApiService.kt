package com.prosync.android.data.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface FcmApiService {
    @POST("fcm/send")
    suspend fun sendNotification(
        @Header("Authorization") serverKey: String,
        @Body payload: FcmPayload
    ): Response<Unit>

    // FCM V1
    @POST("v1/projects/canchalibre-6d670/messages:send")
    suspend fun sendNotificationV1(
        @Header("Authorization") bearerToken: String,
        @Body payload: FcmV1Payload
    ): Response<Unit>
}
