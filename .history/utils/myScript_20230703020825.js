var navBar = document.getElementById('nav-bar');

    document.addEventListener('mousemove', function(e) {
        var y = e.clientY;

        if (y <= 40) {
            navBar.style.marginBottom = '0px';
            navBar.style.transform = 'rotateX(0deg)';
        } else {
            navBar.style.marginBottom = '-27px';
            navBar.style.transform = 'rotateX(270deg)';
        }
    });