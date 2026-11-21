const form = document.getElementById('orderForm');

if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.order-submit-text');
    const status = document.getElementById('orderStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (status) {
            status.classList.add('hidden');
            status.classList.remove('success', 'error');
            status.textContent = '';
        }

        const originalText = submitText ? submitText.textContent : submitBtn.textContent;
        submitBtn.disabled = true;
        if (submitText) {
            submitText.textContent = "Sending...";
        } else {
            submitBtn.textContent = "Sending...";
        }

        try {
            const selectedPackage = form.querySelector('[name="packageChoice"]:checked');
            if (!selectedPackage) {
                throw new Error("Please select a letter package and try again.");
            }

            const isFamilyPackage = selectedPackage.value === form.dataset.familyUid;
            const isSinglePackage = selectedPackage.value === form.dataset.productUid;
            if (!isFamilyPackage && !isSinglePackage) {
                throw new Error("Please select a valid letter package and try again.");
            }

            const childCount = isFamilyPackage
                ? form.querySelectorAll('#childRows .child-row').length
                : 1;
            if (isFamilyPackage && (childCount < 2 || childCount > 5)) {
                throw new Error("The family pack requires between 2 and 5 children.");
            }

            const checkoutKey = String(childCount);
            if (typeof getStripeLink !== "function" || !getStripeLink(checkoutKey)) {
                throw new Error("Checkout is unavailable for this package right now.");
            }

            const formData = new FormData(form);
            formData.append("access_key", "db8cd445-ed6b-4b73-8d10-23cad811f5a6");

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.status !== 200 || !data.success) {
                throw new Error(data.message || "We couldn't send your order. Please try again.");
            }

            if (status) {
                status.classList.remove('hidden', 'error', 'success');
                status.classList.add('success');
                status.textContent = "Your details were sent successfully. Redirecting to secure payment...";
            }

            if (typeof goTo !== "function" || !goTo(checkoutKey)) {
                throw new Error("Your details were sent, but checkout could not be opened. Please contact us before submitting again.");
            }
        } catch (error) {
            if (status) {
                status.classList.remove('hidden', 'success');
                status.classList.add('error');
                status.textContent = error.message || "Something went wrong. Please try again.";
            } else {
                alert(error.message || "Something went wrong. Please try again.");
            }
        } finally {
            if (submitText) {
                submitText.textContent = originalText;
            } else {
                submitBtn.textContent = originalText;
            }
            submitBtn.disabled = false;
        }
    });
}