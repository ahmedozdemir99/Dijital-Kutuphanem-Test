package com.dijitalkutuphanem.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;



/**
 * Dijital Kütüphanem - Bağımsız Hafif Android Ana Ekran Widget'ı (4x2 / 5x2)
 * Üç eşit sütun:
 *  1. KİTAP -> Bugün / Kütüphanem açılır
 *  2. KUR'AN -> Kur'an-ı Kerim bölümü açılır
 *  3. İLİM YOLCULUĞUM -> 40 Yıllık Okuma Müfredatı açılır
 */
public class DijitalKutuphanemWidgetProvider extends AppWidgetProvider {

    public static final String APP_URL = "https://dijitalkutuphanem.ai.studio";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        // Arka planda verileri güvenli şekilde güncelle
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_dijital_kutuphanem);

        // Her sütuna özel tıklama bağlantıları
        views.setOnClickPendingIntent(R.id.col_kitap, createWebPendingIntent(context, APP_URL + "/?tab=today", 101));
        views.setOnClickPendingIntent(R.id.col_quran, createWebPendingIntent(context, APP_URL + "/?tab=explore&sub=quran", 102));
        views.setOnClickPendingIntent(R.id.col_ilim, createWebPendingIntent(context, APP_URL + "/?tab=explore&sub=curriculum", 103));
        views.setOnClickPendingIntent(R.id.widget_header, createWebPendingIntent(context, APP_URL, 100));

        // The device widget has no access to the browser's private reading data.
        views.setTextViewText(R.id.txt_kitap_yuzde, "—");
        views.setTextViewText(R.id.txt_kitap_sayfa, "Aç ve gör");
        views.setTextViewText(R.id.txt_quran_yuzde, "—");
        views.setTextViewText(R.id.txt_quran_hizb, "Aç ve gör");
        views.setTextViewText(R.id.txt_ilim_yuzde, "—");
        views.setTextViewText(R.id.txt_ilim_eser, "Aç ve gör");

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

}
