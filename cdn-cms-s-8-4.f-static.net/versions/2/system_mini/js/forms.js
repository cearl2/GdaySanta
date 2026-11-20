const form = document.getElementById('orderForm');

if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.order-submit-text');
    const status = document.getElementById('orderStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append("access_key", "db8cd445-ed6b-4b73-8d10-23cad811f5a6");

        const originalText = submitText ? submitText.textContent : submitBtn.textContent;
        submitBtn.disabled = true;
        if (submitText) {
            submitText.textContent = "Sending...";
        } else {
            submitBtn.textContent = "Sending...";
        }

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.status !== 200 || !data.success) {
                throw new Error(data.message || "We couldn't send your order. Please try again.");
            }

            const selectedPackage = form.querySelector('[name="packageChoice"]:checked');
            let checkoutUrl;
            if (selectedPackage && selectedPackage.value === form.dataset.familyUid) {
                checkoutUrl = "https://buy.stripe.com/test_4gM5kw0UXaYS2kr1q14Ni00";
            } else if (selectedPackage && selectedPackage.value === form.dataset.productUid) {
                checkoutUrl = "https://buy.stripe.com/test_28E8wIfPR0kebV1ecN4Ni01";
            } else {
                throw new Error("Please select a letter package and try again.");
            }

            window.location.assign(checkoutUrl);
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