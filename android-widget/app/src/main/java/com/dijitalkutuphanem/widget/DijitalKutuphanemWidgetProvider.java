package com.dijitalkutuphanem.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Dijital Kütüphanem - Bağımsız Hafif Android Ana Ekran Widget'ı (4x2 / 5x2)
 * Üç eşit sütun:
 *  1. KİTAP -> Bugün / Kütüphanem açılır
 *  2. KUR'AN -> Kur'an-ı Kerim bölümü açılır
 *  3. İLİM YOLCULUĞUM -> 40 Yıllık Okuma Müfredatı açılır
 */
public class DijitalKutuphanemWidgetProvider extends AppWidgetProvider {

    public static final String APP_URL = "https://dijitalkutuphanem.ai.studio";
    private static final String PREFS_NAME = "DijitalKutuphanemWidgetPrefs";
    private static final String KEY_PROGRESS_CACHE = "cached_progress_json";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        // Arka planda verileri güvenli şekilde güncelle
        fetchRealDataAsync(context, appWidgetManager, appWidgetIds);
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_dijital_kutuphanem);

        // Her sütuna özel tıklama bağlantıları
        views.setOnClickPendingIntent(R.id.col_kitap, createWebPendingIntent(context, APP_URL + "/?tab=today", 101));
        views.setOnClickPendingIntent(R.id.col_quran, createWebPendingIntent(context, APP_URL + "/?tab=explore&sub=quran", 102));
        views.setOnClickPendingIntent(R.id.col_ilim, createWebPendingIntent(context, APP_URL + "/?tab=explore&sub=curriculum", 103));
        views.setOnClickPendingIntent(R.id.widget_header, createWebPendingIntent(context, APP_URL, 100));

        // Önbellekteki veya varsayılan verileri yükle
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String cachedJson = prefs.getString(KEY_PROGRESS_CACHE, null);

        if (cachedJson != null && !cachedJson.isEmpty()) {
            try {
                JSONObject json = new JSONObject(cachedJson);
                // 1. Kitap Verileri
                int bookPercent = json.optInt("bookPercent", -1);
                int todayPages = json.optInt("todayPages", -1);
                int dailyTarget = json.optInt("dailyTarget", 40);

                if (bookPercent >= 0) {
                    views.setTextViewText(R.id.txt_kitap_yuzde, "%" + bookPercent);
                    views.setTextViewText(R.id.txt_kitap_sayfa, todayPages + " / " + dailyTarget + " syf");
                }

                // 2. Kur'an Verileri
                int hatimPercent = json.optInt("hatimPercent", -1);
                int currentHizb = json.optInt("currentHizb", -1);

                if (hatimPercent >= 0) {
                    views.setTextViewText(R.id.txt_quran_yuzde, "%" + hatimPercent);
                    views.setTextViewText(R.id.txt_quran_hizb, currentHizb + ". Hizb");
                }

                // 3. İlim Verileri
                double ilimPercent = json.optDouble("ilimPercent", -1);
                int completedBooks = json.optInt("completedBooks", -1);

                if (ilimPercent >= 0) {
                    views.setTextViewText(R.id.txt_ilim_yuzde, "%" + String.format("%.1f", ilimPercent));
                    views.setTextViewText(R.id.txt_ilim_eser, completedBooks + " Eser");
                }
            } catch (Exception e) {
                // Hata durumunda sahte veri basma, yerel arayüzü koru
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent createWebPendingIntent(Context context, String url, int requestCode) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(
                context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void fetchRealDataAsync(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        new Thread(() -> {
            try {
                URL url = new URL(APP_URL + "/api/widget-data");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();

                    String jsonStr = sb.toString();
                    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                            .edit()
                            .putString(KEY_PROGRESS_CACHE, jsonStr)
                            .apply();

                    for (int appWidgetId : appWidgetIds) {
                        updateAppWidget(context, appWidgetManager, appWidgetId);
                    }
                }
            } catch (Exception ignored) {
                // Ağ yoksa veya çevrimdışıysa önbellekteki son eşitlenen veriyi korur
            }
        }).start();
    }
}
