package com.dijitalkutuphanem.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

/**
 * Dijital Kütüphanem - Tek Yatay Premium Android Widget (4x2 / 5x2)
 * Üç eşit sütun:
 *  1. KİTAP -> Bugün / Kütüphanem açılır
 *  2. KUR'AN -> Kur'an-ı Kerim bölümü açılır
 *  3. İLİM YOLCULUĞUM -> 40 Yıllık Okuma Müfredatı açılır
 */
public class DijitalKutuphanemWidgetProvider extends AppWidgetProvider {

    private static final String APP_URL = "https://dijitalkutuphanem.ai.studio";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.dijital_kutuphanem_widget);

        // 1. Sütun Tıklaması: Kitap (Bugün / Kütüphanem)
        Intent bookIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL + "/?tab=today"));
        PendingIntent bookPendingIntent = PendingIntent.getActivity(
                context, 101, bookIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.col_kitap, bookPendingIntent);

        // 2. Sütun Tıklaması: Kur'an-ı Kerim
        Intent quranIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL + "/?tab=explore&sub=quran"));
        PendingIntent quranPendingIntent = PendingIntent.getActivity(
                context, 102, quranIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.col_quran, quranPendingIntent);

        // 3. Sütun Tıklaması: İlim Yolculuğum (40 Yıllık Müfredat)
        Intent ilimIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL + "/?tab=explore&sub=curriculum"));
        PendingIntent ilimPendingIntent = PendingIntent.getActivity(
                context, 103, ilimIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.col_ilim, ilimPendingIntent);

        // Widget Başlığına Tıklayınca Ana Uygulamayı Aç
        Intent mainIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL));
        PendingIntent mainPendingIntent = PendingIntent.getActivity(
                context, 100, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_header, mainPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
