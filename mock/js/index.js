const init = () => {
    return new Promise((resolve, reject) => {
        const btnEl = document.getElementById('btn');
        const containerEl = document.querySelector('.container');

        const onBtnClickHandler = () => {
            const pictureEl = document.getElementById('picture');
            if (pictureEl) {
                pictureEl.remove();
                btnEl.innerText = 'Add Picture';
            } else {
                const parent = document.createElement('div');
                const child = document.createElement('img');
                parent.id = 'picture';
                child.src =
                    'https://raw.githubusercontent.com/Lindeneg/cl-create/master/plop-templates/html/assets/images/earth.jpg';
                child.alt = 'picture of earth';
                btnEl.innerText = 'Remove Picture';

                btnEl.remove();
                parent.appendChild(child);
                containerEl.appendChild(parent);
                containerEl.appendChild(btnEl);
            }
        };

        if (btnEl) {
            btnEl.addEventListener('click', onBtnClickHandler);
            resolve();
        } else {
            reject('button element could not be found');
        }
    });
};

window.onload = () => {
    console.debug('debug: initializing core logic');
    init()
        .then(() => {
            console.debug('success: initialized core logic');
        })
        .catch((err) => {
            console.error('error: ', err);
        });
};
