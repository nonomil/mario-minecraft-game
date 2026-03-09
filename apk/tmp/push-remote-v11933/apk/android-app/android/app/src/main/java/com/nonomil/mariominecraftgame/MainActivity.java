package com.nonomil.mariominecraftgame;

import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setupFullscreen();
    applyImmersiveMode();
    applyWebViewDefaults();
    wireWindowInsetsToCssSafeArea();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) applyImmersiveMode();
  }

  private void setupFullscreen() {
    Window window = getWindow();
    // 支持刘海屏/挖孔屏延伸到刘海区域
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      WindowManager.LayoutParams lp = window.getAttributes();
      lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
      window.setAttributes(lp);
    }
    // 设置全屏标志（移除 FLAG_LAYOUT_NO_LIMITS 避免内容超出屏幕）
    window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
  }

  private void applyWebViewDefaults() {
    if (bridge == null || bridge.getWebView() == null) return;
    WebSettings settings = bridge.getWebView().getSettings();
    if (settings == null) return;
    settings.setTextZoom(100);
  }

  private void wireWindowInsetsToCssSafeArea() {
    final View decorView = getWindow().getDecorView();
    decorView.setOnApplyWindowInsetsListener(
        (v, insets) -> {
          int top = 0, right = 0, bottom = 0, left = 0;

          if (Build.VERSION.SDK_INT >= 30) {
            Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
            Insets cutout = insets.getInsets(WindowInsets.Type.displayCutout());
            Insets gestures = insets.getInsets(WindowInsets.Type.systemGestures());

            top = Math.max(bars.top, cutout.top);
            right = Math.max(bars.right, cutout.right);
            bottom = Math.max(Math.max(bars.bottom, cutout.bottom), gestures.bottom);
            left = Math.max(bars.left, cutout.left);
          } else {
            // Pre-Android 11: best effort. Gesture insets aren't available here.
            top = insets.getSystemWindowInsetTop();
            right = insets.getSystemWindowInsetRight();
            bottom = insets.getSystemWindowInsetBottom();
            left = insets.getSystemWindowInsetLeft();
          }

          pushSafeAreaToWeb(top, right, bottom, left);
          return insets;
        });

    // Ensure we apply once after view is attached, then keep updating on inset changes.
    decorView.post(decorView::requestApplyInsets);
  }

  private void pushSafeAreaToWeb(int topPx, int rightPx, int bottomPx, int leftPx) {
    if (bridge == null || bridge.getWebView() == null) return;

    final String js =
        "(function(){try{"
            + "var dpr=window.devicePixelRatio||1;"
            + "var t="
            + topPx
            + ",r="
            + rightPx
            + ",b="
            + bottomPx
            + ",l="
            + leftPx
            + ";"
            + "var root=document.documentElement;"
            + "if(!root){return;}"
            + "root.style.setProperty('--safe-top',(t/dpr)+'px');"
            + "root.style.setProperty('--safe-right',(r/dpr)+'px');"
            + "root.style.setProperty('--safe-bottom',(b/dpr)+'px');"
            + "root.style.setProperty('--safe-left',(l/dpr)+'px');"
            + "}catch(e){}})();";

    bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(js, null));
  }

  private void applyImmersiveMode() {
    if (Build.VERSION.SDK_INT >= 30) {
      WindowInsetsController controller = getWindow().getInsetsController();
      if (controller != null) {
        controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
        controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      }
      return;
    }
    View decorView = getWindow().getDecorView();
    int flags =
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
    decorView.setSystemUiVisibility(flags);
  }
}
