#import "CDVDigits.h"

#import <Cordova/CDV.h>
#import <DigitsKit/DigitsKit.h>
#import <Fabric/Fabric.h>

@implementation CDVDigits

- (void)pluginInitialize {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(finishLaunching:) name:UIApplicationDidFinishLaunchingNotification object:nil];
}

- (void)finishLaunching:(NSNotification *)notification {
  [Fabric with:@[[Digits class]]];
}

- (void)authenticate:(CDVInvokedUrlCommand*)command {
  [[Digits sharedInstance] authenticateWithCompletion:^(DGTSession* session, NSError *error) {
    CDVPluginResult* pluginResult = nil;

    if (session) {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
      pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

@end
