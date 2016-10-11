package com.jimmymakesthings.plugins.digits;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;

import java.util.*;
import android.app.Activity;
import android.util.Log;
import android.os.Bundle;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.twitter.sdk.android.core.TwitterAuthConfig;
import com.twitter.sdk.android.core.TwitterAuthToken;
import com.twitter.sdk.android.core.TwitterCore;
import io.fabric.sdk.android.Fabric;

import com.digits.sdk.android.*;
import com.crashlytics.android.Crashlytics;

public class CordovaDigits extends CordovaPlugin {
  volatile DigitsClient digitsClient;
  private static final String META_DATA_KEY = "io.fabric.ConsumerKey";
  private static final String META_DATA_SECRET = "io.fabric.ConsumerSecret";
  private static final String TAG = "CORDOVA PLUGIN DIGITS";

  private AuthCallback authCallback;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    TwitterAuthConfig authConfig = getTwitterConfig();
    Fabric.with(cordova.getActivity().getApplicationContext(), new Crashlytics(), new TwitterCore(authConfig), new Digits());
    Digits.getInstance().getFabric().setCurrentActivity(cordova.getActivity());
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    Log.i(TAG, "executing action " + action);

    if ("authenticate".equals(action)) {
      authenticate(callbackContext, args);
    } else if ("logout".equals(action)) {
      logout(callbackContext);
    } else {
      Log.w(TAG, "unknown action `" + action + "`");
      return false;
    }

    return true;
  }

  public void authenticate(final CallbackContext callbackContext, JSONArray args) throws JSONException {
    authCallback = new AuthCallback() {
      @Override
      public void success(DigitsSession session, String phoneNumber) {
        // Do something with the session and phone number
        Log.i(TAG, "authentication successful");

        TwitterAuthConfig authConfig = TwitterCore.getInstance().getAuthConfig();
        TwitterAuthToken authToken = (TwitterAuthToken) session.getAuthToken();
        DigitsOAuthSigning oauthSigning = new DigitsOAuthSigning(authConfig, authToken);
        Map<String, String> authHeaders = oauthSigning.getOAuthEchoHeadersForVerifyCredentials();

        String result = new JSONObject(authHeaders).toString();
        callbackContext.success(result);
      }

      @Override
      public void failure(DigitsException exception) {
        // Do something on failure
        Log.e(TAG, "error " + exception.getMessage());
        callbackContext.error(exception.getMessage());
      }
    };

    DigitsAuthConfig.Builder digitsAuthConfigBuilder = new DigitsAuthConfig.Builder()
           .withAuthCallBack(authCallback)
           .withThemeResId(cordova.getActivity().getResources().getIdentifier("CustomDigitsTheme", "style", cordova.getActivity().getPackageName()));

    if (!args.isNull(0)) {
        if (args.optJSONObject(0).has("phoneNumber")) {
            digitsAuthConfigBuilder.withPhoneNumber(args.optJSONObject(0).getString("phoneNumber"));
        } else if (args.optJSONObject(0).has("sandbox") && args.optJSONObject(0).getBoolean("sandbox") == true) {
            Digits.enableSandbox();
        }
    }

    Digits.authenticate(digitsAuthConfigBuilder.build());
  }

  public void logout(final CallbackContext callbackContext) {
    Digits.getSessionManager().clearActiveSession();
  }

  private TwitterAuthConfig getTwitterConfig() {
    String key = getMetaData(META_DATA_KEY);
    String secret = getMetaData(META_DATA_SECRET);

    return new TwitterAuthConfig(key, secret);
  }

  private String getMetaData(String name) {
    try {
      Context context = cordova.getActivity().getApplicationContext();
      ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);

      Bundle metaData = ai.metaData;
      if(metaData == null) {
        Log.w(TAG, "metaData is null. Unable to get meta data for " + name);
      }
      else {
        String value = metaData.getString(name);
        return value;
      }
    } catch (NameNotFoundException e) {
      e.printStackTrace();
    }
    return null;
  }
}
