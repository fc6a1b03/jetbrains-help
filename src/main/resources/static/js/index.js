$(document).ready(() => {
    // Set default headers for AJAX requests
    $.ajaxSetup({
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Function to handle submission of license information
    window.submitLicenseInfo = () => {
        const licenseInfo = {
            licenseeName: $('#licenseeName').val(),
            assigneeName: $('#assigneeName').val(),
            expiryDate: $('#expiryDate').val()
        };
        localStorage.setItem('licenseInfo', JSON.stringify(licenseInfo));
        $('#mask, #form').hide();
    };

    // Function to handle search input
    $('#search').on('input', (e) => {
        $("#product-list").load(`/search?search=${e.target.value}`);
    });

    // Function to show license form
    window.showLicenseForm = () => {
        const licenseInfo = JSON.parse(localStorage.getItem('licenseInfo')) || {};
        $('#licenseeName').val(licenseInfo.licenseeName || '');
        $('#assigneeName').val(licenseInfo.assigneeName || '');
        $('#expiryDate').val(licenseInfo.expiryDate || '2111-11-11');
        $('#mask, #form').show();
    };

    // Function to show VM options
    window.showVmoptins = () => {
        const text = `-javaagent:/(Your Path)/ja-netfilter/ja-netfilter.jar
--add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED`;
        copyText(text)
            .then((result) => {
                alert(result);
            });
    };

    // Function to copy license
    window.copyLicense = async (e) => {
        while (localStorage.getItem('licenseInfo') === null) {
            $('#mask, #form').show();
            await new Promise(r => setTimeout(r, 1000));
        }
        const licenseInfo = JSON.parse(localStorage.getItem('licenseInfo'));
        const productCode = $(e.target).closest('.card').data('productCodes');
        const data = {
            licenseName: licenseInfo.licenseeName,
            assigneeName: licenseInfo.assigneeName,
            expiryDate: licenseInfo.expiryDate,
            productCode: productCode,
        };
        $.post('/generateLicense', JSON.stringify(data))
            .then(response => {
                copyText(response)
                    .then(() => {
                        alert("已复制成功");
                    })
                    .catch(() => {
                        alert("系统不支持复制功能,或者当前非SSL访问,若为Local环境,请使用127.0.0.1或者localhost访问.");
                    });
            });
    };

    // Function to copy text to clipboard
    const copyText = async (val) => {
        if (navigator.clipboard && navigator.permissions) {
            return navigator.clipboard.writeText(val);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = val;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }
    };
});
