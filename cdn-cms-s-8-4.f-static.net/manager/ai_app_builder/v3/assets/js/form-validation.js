(function() {
    const form = document.getElementById('orderForm');
    if (!form) {
        return;
    }

    const status = document.getElementById('orderStatus');

    function showError(message) {
        if (status) {
            status.classList.remove('hidden', 'success', 'error');
            status.classList.add('error');
            status.textContent = message;
        } else {
            alert(message);
        }
    }

    form.addEventListener('submit', (event) => {
        const selectedPackage = form.querySelector('[name="packageChoice"]:checked');
        const isFamilyPackage = selectedPackage && selectedPackage.value === form.dataset.familyUid;
        const children = isFamilyPackage
            ? Array.from(form.querySelectorAll('#childRows .child-row')).map((row, index) => ({
                number: index + 1,
                nameField: row.querySelector('[name="familyChildName"]'),
                detailField: row.querySelector('[name="familyChildDetail"]')
            }))
            : [{
                number: 1,
                nameField: form.querySelector('[name="childName"]'),
                detailField: form.querySelector('[name="childDetail"]')
            }];

        const incompleteChildren = children.filter((child) =>
            !child.nameField || child.nameField.value.trim().length < 2 ||
            !child.detailField || child.detailField.value.trim().length < 4
        );

        if (incompleteChildren.length === 0) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        const childLabels = incompleteChildren.map((child) => `Child ${child.number}`);
        const childList = childLabels.join(', ');
        const verb = incompleteChildren.length === 1 ? 'has' : 'have';
        showError(`${childList} ${verb} incomplete details. Please check first name and a detail for Santa.`);

        const firstIncompleteChild = incompleteChildren[0];
        const nameIsMissing = !firstIncompleteChild.nameField ||
            firstIncompleteChild.nameField.value.trim().length < 2;
        const fieldToFocus = nameIsMissing
            ? firstIncompleteChild.nameField
            : firstIncompleteChild.detailField;
        if (fieldToFocus) {
            fieldToFocus.focus();
        }
    }, true);
})();
