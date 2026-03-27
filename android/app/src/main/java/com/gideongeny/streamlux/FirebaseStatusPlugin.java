package com.gideongeny.streamlux;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "FirebaseStatus")
public class FirebaseStatusPlugin extends Plugin {
  @PluginMethod
  public void isFirebaseAvailable(PluginCall call) {
    boolean available = false;
    try {
      // Use reflection so this compiles even when Firebase dependencies are not present.
      Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
      firebaseAppClass.getMethod("getInstance").invoke(null);
      available = true;
    } catch (Exception ignored) {
      available = false;
    }

    JSObject ret = new JSObject();
    ret.put("available", available);
    call.resolve(ret);
  }
}

