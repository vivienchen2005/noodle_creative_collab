// SequentialUI.js
//@input Component.Image[] imageComponents {"label": "UI Image List"}
//@input float displayDuration = 1.5 {"label": "Display Time (seconds)"}
//@input float fadeDuration = 0.3 {"label": "Fade Duration (seconds)"}
//@input bool loopSequence = false {"label": "Loop Sequence"}
//@input bool startOnAwake = true {"label": "Start Automatically"}

var currentIndex = 0;
var timer = 0;
var isPlaying = false;
var isComplete = false;

// Validate inputs
if (!script.imageComponents || script.imageComponents.length === 0) {
    print("ERROR: Please assign UI Image Components!");
    return;
}

// Hide all images at start
for (var i = 0; i < script.imageComponents.length; i++) {
    if (script.imageComponents[i]) {
        setImageAlpha(script.imageComponents[i], 0);
    }
}

// Auto-start if enabled
if (script.startOnAwake) {
    isPlaying = true;
    showImage(0);
}

// Update loop
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

function onUpdate(eventData) {
    if (!isPlaying || isComplete) {
        return;
    }
    
    timer += getDeltaTime();
    
    // Check if this is the last image
    var isLastImage = (currentIndex === script.imageComponents.length - 1) && !script.loopSequence;
    
    // Calculate total time - last image doesn't fade out, so no fade out duration
    var totalTime = isLastImage 
        ? script.displayDuration + script.fadeDuration  // fade in + hold only
        : script.displayDuration + (script.fadeDuration * 2);  // fade in + hold + fade out
    
    var alpha = calculateAlpha(timer, isLastImage);
    
    if (script.imageComponents[currentIndex]) {
        setImageAlpha(script.imageComponents[currentIndex], alpha);
    }
    
    // Move to next image (only if not last image or looping)
    if (timer >= totalTime && !isLastImage) {
        nextImage();
    }
}

function showImage(index) {
    if (index >= 0 && index < script.imageComponents.length) {
        currentIndex = index;
        timer = 0;
    }
}

function nextImage() {
    // Fade out current
    if (script.imageComponents[currentIndex]) {
        setImageAlpha(script.imageComponents[currentIndex], 0);
    }
    
    currentIndex++;
    
    if (currentIndex >= script.imageComponents.length) {
        if (script.loopSequence) {
            currentIndex = 0;
            showImage(currentIndex);
        } else {
            isComplete = true;
            isPlaying = false;
        }
    } else {
        showImage(currentIndex);
    }
}

function calculateAlpha(t) {
    var fadeIn = script.fadeDuration;
    var hold = script.displayDuration;
    var fadeOut = script.fadeDuration;
    
    if (t < fadeIn) {
        // Fade in
        return t / fadeIn;
    } else if (t < fadeIn + hold) {
        // Hold at full opacity
        return 1.0;
    } else {
        // Fade out
        var fadeOutProgress = (t - fadeIn - hold) / fadeOut;
        return Math.max(0, 1.0 - fadeOutProgress);
    }
}

function setImageAlpha(imageComponent, alpha) {
    var mat = imageComponent.mainPass;
    var color = mat.baseColor;
    mat.baseColor = new vec4(color.r, color.g, color.b, alpha);
}

// Public function to restart sequence
script.restart = function() {
    isComplete = false;
    isPlaying = true;
    currentIndex = 0;
    
    // Hide all
    for (var i = 0; i < script.imageComponents.length; i++) {
        if (script.imageComponents[i]) {
            setImageAlpha(script.imageComponents[i], 0);
        }
    }
    
    showImage(0);
};