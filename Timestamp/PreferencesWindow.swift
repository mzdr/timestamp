//
//  PreferencesWindow.swift
//  Timestamp
//
//  Created by Sebastian Prein on 19.12.15.
//  Copyright © 2015 Hyst. All rights reserved.
//

import Cocoa

protocol PreferencesWindowDelegate {
    func preferencesDidUpdate()
}


class PreferencesWindow: NSWindowController, NSWindowDelegate {
    
    @IBOutlet weak var dateFormatField: NSTextField!
    
    var delegate: PreferencesWindowDelegate?
    
    override var windowNibName : String! {
        return "PreferencesWindow"
    }
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        self.window?.center()
        self.window?.makeKeyAndOrderFront(nil)
        NSApp.activateIgnoringOtherApps(true)
        
        let defaults = NSUserDefaults.standardUserDefaults()
        let format = defaults.stringForKey("format") ?? DEFAULT_FORMAT
        dateFormatField.stringValue = format
    }
    
    func windowWillClose(notification: NSNotification) {
        let defaults = NSUserDefaults.standardUserDefaults()
        defaults.setValue(dateFormatField.stringValue, forKey: "format")
        
        delegate?.preferencesDidUpdate()
    }
    
    
    @IBAction func helpClicked(sender: NSButton) {
        let url = "http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns"
        
        NSWorkspace.sharedWorkspace().openURL(NSURL(string: url)!)
    }
}
