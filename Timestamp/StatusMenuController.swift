//
//  StatusMenuController.swift
//  Timestamp
//
//  Created by Sebastian Prein on 19.12.15.
//  Copyright © 2015 Hyst. All rights reserved.
//

import Cocoa
let DEFAULT_FORMAT = "ww/QQ  eee, dd.MM.yyyy  HH:mm"

class StatusMenuController: NSObject, PreferencesWindowDelegate {
    
    @IBOutlet weak var statusMenu: NSMenu!
    
    var preferencesWindow: PreferencesWindow!
    var timer = NSTimer()
    
    // NSStatusItem
    let statusItem = NSStatusBar.systemStatusBar().statusItemWithLength(NSVariableStatusItemLength)
    
    // objects have been loaded from an Interface Builder archive (nib file)
    override func awakeFromNib() {
        preferencesWindow = PreferencesWindow()
        preferencesWindow.delegate = self
        
        prepareStatusLabel()
        startTimer()
    }
    
    
    @IBAction func preferencesClicked(sender: NSMenuItem) {
        preferencesWindow.showWindow(nil)
    }
    
    
    // MenuItem click event to quit application
    @IBAction func quitClicked(sender: NSMenuItem) {
        
        // stop timer
        timer.invalidate()
        
        // terminate application
        NSApplication.sharedApplication().terminate(self)
    }
    
    func preferencesDidUpdate() {
        updateStatusLabel()
    }
    
    // prepare the app status menu label
    func prepareStatusLabel() {
        
        // connect label to status menu
        statusItem.menu = statusMenu
        statusItem.title = ""
    }
    
    // update the app status menu label
    func updateStatusLabel() {
        let defaults = NSUserDefaults.standardUserDefaults()
        let format = defaults.stringForKey("format") ?? DEFAULT_FORMAT
        let date = getDateFromFormat(format);
        
        statusItem.title = date;
    }
    
    // starts a timer
    func startTimer() {
        timer = NSTimer.scheduledTimerWithTimeInterval(1, target: self, selector: "tick", userInfo: nil, repeats: true)
    }
    
    // called every time interval from the timer
    func tick() {
        updateStatusLabel();
    }
    
    
    // returns the current date in a specific format
    func getDateFromFormat(format: String) -> String
    {
        // get the current date and time
        let currentDateTime = NSDate()
        
        // get date formatter
        let dateFormatter = NSDateFormatter()
        
        // use format given by parameter
        dateFormatter.dateFormat = format
        
        return dateFormatter.stringFromDate(currentDateTime)
    }
}
