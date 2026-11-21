// Explain: Client-side logic for the letter writing and reply checking forms.
document.addEventListener('DOMContentLoaded', function() {
    var letterForm = document.getElementById('santaLetterForm');
    var letterStatus = document.getElementById('letterStatus');
    var letterSuccess = document.getElementById('letterSuccess');
    var letterSubmit = document.getElementById('letterSubmit');
    var letterSubmitText = document.getElementById('letterSubmitText');
    var successChildName = document.getElementById('successChildName');
    var santaCode = document.getElementById('santaCode');

    var replyForm = document.getElementById('replyCheckForm');
    var replyStatus = document.getElementById('replyStatus');
    var replySubmit = document.getElementById('replySubmit');
    var replySubmitText = document.getElementById('replySubmitText');

    function showStatus(element, type, message) {
        if (!element) {
            return;
        }
        element.classList.remove('hidden', 'success', 'error');
        element.classList.add(type);
        element.textContent = message;
    }

    function clearStatus(element) {
        if (!element) {
            return;
        }
        element.classList.add('hidden');
        element.classList.remove('success', 'error');
        element.textContent = '';
    }

    function fieldValue(form, name) {
        var field = form ? form.querySelector('[name="' + name + '"]') : null;
        return field ? field.value.trim() : '';
    }

    function focusField(form, name) {
        var field = form ? form.querySelector('[name="' + name + '"]') : null;
        if (field && typeof field.focus === 'function') {
            field.focus();
        }
    }

    function makeCode() {
        var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var values = new Uint32Array(6);
        var code = '';
        var i;
        if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
            window.crypto.getRandomValues(values);
        } else {
            for (i = 0; i < values.length; i++) {
                values[i] = Math.floor(Math.random() * 4294967296);
            }
        }
        for (i = 0; i < values.length; i++) {
            code += alphabet.charAt(values[i] % alphabet.length);
        }
        return code;
    }

    if (letterForm) {
        letterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            clearStatus(letterStatus);

            var childName = fieldValue(letterForm, 'childName');
            var childAge = fieldValue(letterForm, 'childAge');
            var present = fieldValue(letterForm, 'present');
            var familyNames = fieldValue(letterForm, 'familyNames');
            var parentNote = fieldValue(letterForm, 'parentNote');
            var email = fieldValue(letterForm, 'parentEmail');

            if (childName.length < 2) {
                showStatus(letterStatus, 'error', 'Add your first name so Santa knows who the letter is from.');
                focusField(letterForm, 'childName');
                return;
            }

            if (present.length < 3) {
                showStatus(letterStatus, 'error', 'Tell Santa one thing you are hoping to find under the tree this Christmas.');
                focusField(letterForm, 'present');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                showStatus(letterStatus, 'error', 'Add a grown-up email address so we can confirm your letter arrived.');
                focusField(letterForm, 'parentEmail');
                return;
            }

            if (!window.DataSystem || typeof window.DataSystem.set !== 'function') {
                showStatus(letterStatus, 'error', 'Letters cannot be posted right now. Please refresh the page and try again.');
                return;
            }

            var code = makeCode();
            var record = {
                child_name: childName,
                child_age: childAge ? Number(childAge) : null,
                present: present,
                family_names: familyNames,
                parent_note: parentNote,
                reply: '',
                replied: false,
                parent_email: email,
                letter_code: code
            };

            if (letterSubmit) {
                letterSubmit.disabled = true;
            }
            if (letterSubmitText) {
                letterSubmitText.textContent = 'Sending to the North Pole…';
            }

            window.DataSystem.set('santa_letters', 'santa-' + code.toLowerCase(), record).then(function(result) {
                if (!result || !result.success) {
                    throw new Error('save-failed');
                }
                if (window.MessagesSystem && typeof window.MessagesSystem.submit === 'function') {
                    return window.MessagesSystem.submit([
                        { label: "Child's name", value: childName, type: 'text' },
                        { label: 'Age', value: childAge, type: 'text' },
                        { label: "Santa's present", value: present, type: 'textarea' },
                        { label: 'Family members', value: familyNames, type: 'text' },
                        { label: 'Parent note', value: parentNote, type: 'textarea' },
                        { label: 'Magic code', value: code, type: 'text' },
                        { label: "Grown-up's email", value: email, type: 'email' }
                    ], letterForm).catch(function() {
                        return null;
                    });
                }
                return null;
            }).then(function() {
                if (successChildName) {
                    successChildName.textContent = childName;
                }
                if (santaCode) {
                    santaCode.textContent = code;
                }
                letterForm.classList.add('hidden');
                if (letterSuccess) {
                    letterSuccess.classList.remove('hidden');
                    if (typeof letterSuccess.scrollIntoView === 'function') {
                        letterSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }).catch(function() {
                showStatus(letterStatus, 'error', 'We could not post your letter just now. Please check your connection and try again.');
            }).finally(function() {
                if (letterSubmit) {
                    letterSubmit.disabled = false;
                }
                if (letterSubmitText) {
                    letterSubmitText.textContent = 'Send my letter to Santa';
                }
            });
        });
    }

    if (replyForm) {
        replyForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            clearStatus(replyStatus);

            var email = fieldValue(replyForm, 'email');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                showStatus(replyStatus, 'error', 'Enter a valid email address and try again.');
                focusField(replyForm, 'email');
                return;
            }

            if (replySubmit) {
                replySubmit.disabled = true;
            }
            if (replySubmitText) {
                replySubmitText.textContent = 'Sending request...';
            }

            try {
                var response = await fetch(replyForm.action, {
                    method: 'POST',
                    body: new FormData(replyForm)
                });
                var data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'We could not send your request. Please try again.');
                }
                showStatus(replyStatus, 'success', "Your request was sent. We'll follow up by email.");
            } catch (error) {
                showStatus(replyStatus, 'error', error.message || 'We could not send your request. Please try again.');
            } finally {
                if (replySubmit) {
                    replySubmit.disabled = false;
                }
                if (replySubmitText) {
                    replySubmitText.textContent = 'Request an email update';
                }
            }
        });
    }
});