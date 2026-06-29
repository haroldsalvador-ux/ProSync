package com.prosync.android.utils

import android.util.Log
import com.prosync.android.data.network.FcmApiService
import com.prosync.android.data.network.FcmNotification
import com.prosync.android.data.network.FcmV1Message
import com.prosync.android.data.network.FcmV1Payload
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object FcmSender {
    private const val BASE_URL = "https://fcm.googleapis.com/v1/projects/canchalibre-6d670/"
    
    // NOTA: Para FCM V1 se requiere un token de OAuth2 que generalmente se genera en un backend seguro.
    // Como esta es una implementación de cliente, aquí deberías proveer el token o usar un intermediario.
    // ADVERTENCIA: No incluir tokens sensibles en el código fuente.
    private var accessToken: String = ""

    private val api: FcmApiService by lazy {
        Retrofit.Builder()
            .baseUrl("https://fcm.googleapis.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FcmApiService::class.java)
    }

    fun setAccessToken(token: String) {
        accessToken = "Bearer $token"
    }

    suspend fun sendNotification(targetToken: String, title: String, body: String) {
        if (accessToken.isEmpty()) {
            Log.e("FcmSender", "Access Token no configurado.")
            return
        }
        val payload = FcmV1Payload(
            message = FcmV1Message(
                token = targetToken,
                notification = FcmNotification(title, body)
            )
        )
        try {
            val response = api.sendNotificationV1(accessToken, payload)
            if (response.isSuccessful) {
                Log.d("FcmSender", "Notificación enviada con éxito")
            } else {
                Log.e("FcmSender", "Error al enviar notificación: ${response.errorBody()?.string()}")
            }
        } catch (e: Exception) {
            Log.e("FcmSender", "Excepción al enviar notificación", e)
        }
    }
}
