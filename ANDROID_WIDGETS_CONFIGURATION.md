# Android Home Screen Widgets Configuration

## Overview

StreamLux supports home screen widgets for quick access to Continue Watching and Trending content.

## Widget Types

### 1. Continue Watching Widget
- Shows last 3 watched items
- Tap to resume playback
- Updates automatically

### 2. Trending Widget
- Shows top 3 trending items
- Refreshes every 6 hours
- Tap to view details

## Implementation

### Widget Provider XML

Create `android/app/src/main/res/xml/continue_watching_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_continue_watching"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/widget_preview" />
```

### Widget Layout

Create `android/app/src/main/res/layout/widget_continue_watching.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="8dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:id="@+id/widget_title"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Continue Watching"
        android:textSize="16sp"
        android:textColor="#FFFFFF"
        android:textStyle="bold"
        android:paddingBottom="8dp" />
    
    <LinearLayout
        android:id="@+id/widget_items"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal" />
</LinearLayout>
```

### Widget Receiver

Add to `AndroidManifest.xml`:

```xml
<receiver
    android:name=".ContinueWatchingWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/continue_watching_widget" />
</receiver>

<receiver
    android:name=".TrendingWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/trending_widget" />
</receiver>
```

## Widget Service (TypeScript)

```typescript
// src/services/widgetService.ts

import { Capacitor } from '@capacitor/core';

class WidgetService {
  /**
   * Update Continue Watching widget
   */
  async updateContinueWatchingWidget(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    // Get continue watching data
    const items = await continueWatchingService.getContinueWatching(3);
    
    // Send to native layer for widget update
    // This would use a Capacitor plugin bridge
    console.log('Updating Continue Watching widget:', items);
  }

  /**
   * Update Trending widget
   */
  async updateTrendingWidget(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    // Get trending data
    // Send to native layer
    console.log('Updating Trending widget');
  }

  /**
   * Schedule widget updates
   */
  scheduleUpdates(): void {
    // Update every 30 minutes
    setInterval(() => {
      this.updateContinueWatchingWidget();
      this.updateTrendingWidget();
    }, 30 * 60 * 1000);
  }
}

export const widgetService = new WidgetService();
```

## Widget Background

Create `android/app/src/main/res/drawable/widget_background.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#1a1a1a" />
    <corners android:radius="16dp" />
    <stroke
        android:width="1dp"
        android:color="#333333" />
</shape>
```

## Widget Preview Image

Create preview images:
- `res/drawable-nodpi/widget_preview.png` (312x144 pixels)
- Shows what the widget looks like

## Widget Sizes

### Small Widget (2x1):
- Width: 110dp
- Height: 110dp
- Shows 1 item

### Medium Widget (4x1):
- Width: 250dp
- Height: 110dp
- Shows 3 items

### Large Widget (4x2):
- Width: 250dp
- Height: 250dp
- Shows 6 items

## Testing Widgets

1. Build and install app
2. Long-press home screen
3. Tap "Widgets"
4. Find "StreamLux"
5. Drag widget to home screen
6. Verify data updates

## Widget Update Triggers

- App launch
- Content watched
- Every 30 minutes (automatic)
- Manual refresh (pull-to-refresh)

## Best Practices

- Keep widgets lightweight
- Use cached data
- Update in background
- Handle click events
- Provide loading states
- Support dark/light themes

## Troubleshooting

**Widget not appearing:**
- Check AndroidManifest.xml
- Verify widget provider XML
- Rebuild app

**Widget not updating:**
- Check update interval
- Verify data source
- Check permissions

**Widget crashes:**
- Check layout XML
- Verify image resources
- Check data handling
