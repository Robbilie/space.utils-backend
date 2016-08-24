var foreground, background;
window.addEventListener("load", function () {
    background = particleground(document.getElementById('particles-background'), {
        dotColor: 'rgba(255, 255, 255, 0.5)',
        lineColor: 'rgba(255, 255, 255, 0.05)',
        minSpeedX: 0.075,
        maxSpeedX: 0.15,
        minSpeedY: 0.075,
        maxSpeedY: 0.15,
        density: 30000, // One particle every n pixels
        curvedLines: false,
        proximity: 20, // How close two dots need to be before they join
        parallaxMultiplier: 20, // Lower the number is more extreme parallax
        particleRadius: 2, // Dot size
        parallax: false,
    });
    background.pause();
    foreground = particleground(document.getElementById('particles-foreground'), {
        dotColor: 'rgba(255, 255, 255, 1)',
        lineColor: 'rgba(255, 255, 255, 0.05)',
        minSpeedX: 0.3,
        maxSpeedX: 0.6,
        minSpeedY: 0.3,
        maxSpeedY: 0.6,
        density: 50000, // One particle every n pixels
        curvedLines: false,
        proximity: 250, // How close two dots need to be before they join
        parallaxMultiplier: 10, // Lower the number is more extreme parallax
        particleRadius: 4, // Dot size
        parallax: false,
    });
    foreground.pause();
});
window.addEventListener("resize", function () {
    if(background) {
        background.start();
        background.pause();
    }
    if(foreground) {
        foreground.start();
        foreground.pause();
    }
});