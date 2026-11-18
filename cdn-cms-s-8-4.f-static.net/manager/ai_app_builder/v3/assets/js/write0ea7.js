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
    var replyResult = document.getElementById('replyResult');
    var replyChildName = document.getElementById('replyChildName');
    var replyText = document.getElementById('replyText');
    var replyWaiting = document.getElementById('replyWaiting');
    var replySignoff = document.getElementById('replySignoff');
    var replyChildLetter = document.getElementById('replyChildLetter');
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

    function renderReply(row) {
        var replyBody = row.reply ? String(row.reply).trim() : '';
        var askedFor = row.present ? String(row.present).trim() : '';
        var familyList = row.family_names ? String(row.family_names).trim() : '';

        if (replyChildName) {
            replyChildName.textContent = row.child_name ? String(row.child_name) : 'friend';
        }
        if (replyChildLetter) {
            var sentLines = [];
            if (askedFor) { sentLines.push(askedFor); }
            if (familyList) { sentLines.push('Family: ' + familyList); }
            replyChildLetter.textContent = sentLines.join('\n');
        }
        clearStatus(replyStatus);

        if (replyBody) {
            if (replyText) {
                replyText.textContent = replyBody;
                replyText.classList.remove('hidden');
            }
            if (replyWaiting) {
                replyWaiting.classList.add('hidden');
            }
            if (replySignoff) {
                replySignoff.classList.remove('hidden');
            }
        } else {
            if (replyText) {
                replyText.classList.add('hidden');
            }
            if (replyWaiting) {
                replyWaiting.classList.remove('hidden');
            }
            if (replySignoff) {
                replySignoff.classList.add('hidden');
            }
        }

        if (replyResult) {
            replyResult.classList.remove('hidden');
            if (typeof replyResult.scrollIntoView === 'function') {
                replyResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
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
        replyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            clearStatus(replyStatus);
            if (replyResult) {
                replyResult.classList.add('hidden');
            }

            var code = fieldValue(replyForm, 'code').toUpperCase().replace(/[^A-Z0-9]/g, '');

            if (code.length !== 6) {
                showStatus(replyStatus, 'error', 'Type the 6-character magic code from your letter confirmation.');
                focusField(replyForm, 'code');
                return;
            }

            if (!window.DataSystem || typeof window.DataSystem.get !== 'function') {
                showStatus(replyStatus, 'error', "Santa's letterbox is closed right now. Please refresh the page and try again.");
                return;
            }

            if (replySubmit) {
                replySubmit.disabled = true;
            }
            if (replySubmitText) {
                replySubmitText.textContent = 'Looking for your letter…';
            }

            window.DataSystem.get('santa_letters', 'santa-' + code.toLowerCase()).then(function(result) {
                if (!result || !result.success || !result.exists || !result.data_json) {
                    showStatus(replyStatus, 'error', 'We could not find a letter with that code. Check the six characters and try again.');
                    return;
                }

                var row = null;
                try {
                    row = JSON.parse(result.data_json);
                } catch (error) {
                    row = null;
                }

                if (!row) {
                    showStatus(replyStatus, 'error', 'We could not open that letter. Please try again in a moment.');
                    return;
                }

                renderReply(row);
            }).catch(function() {
                showStatus(replyStatus, 'error', 'We could not reach the North Pole just now. Please check your connection and try again.');
            }).finally(function() {
                if (replySubmit) {
                    replySubmit.disabled = false;
                }
                if (replySubmitText) {
                    replySubmitText.textContent = "Show Santa's reply";
                }
            });
        });
    }
});