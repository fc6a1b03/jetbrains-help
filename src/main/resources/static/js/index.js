document.addEventListener('DOMContentLoaded', async () => {
  const licenseInfo = JSON.parse(localStorage.getItem('licenseInfo'));
  if (!licenseInfo) {
    document.getElementById('mask').style.display = 'block';
    document.getElementById('form').style.display = 'block';
  }

  async function copyText(val) {
    if (navigator.clipboard && navigator.permissions) {
      await navigator.clipboard.writeText(val);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = val;
      document.body.appendChild(textArea);
      textArea.select();
      return new Promise((res, rej) => {
        if (document.execCommand('copy')) {
          res();
        } else {
          rej();
        }
        document.body.removeChild(textArea);
      });
    }
  }
  
  async function copyLicense(event) {
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;
    if (!licenseInfo) {
      alert('请先填写许可信息');
      return;
    }
    const productCode = productCard.dataset.productCode;
    const data = {
      licenseName: licenseInfo.licenseeName,
      assigneeName: licenseInfo.assigneeName,
      expiryDate: licenseInfo.expiryDate,
      productCode,
    };
    const response = await fetch('generateLicense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await response.text();
		copyText(text)
      .then(() => {
      	alert("已复制成功");
   		})
      .catch(() => {
      	alert("系统不支持复制功能,或者当前非SSL访问,若为Local环境,请使用127.0.0.1或者localhost访问.");
    	});
  }

  async function showVmoptions() {
    copyText(`-javaagent:/(Your Path)/ja-netfilter/ja-netfilter.jar
--add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED`)
      .then(() => {
      	alert("已复制成功");
    	})
      .catch(() => {
      	alert("系统不支持复制功能,或者当前非SSL访问,若为Local环境,请使用127.0.0.1或者localhost访问.");
    	});
  }

  function submitLicenseInfo() {
    const licenseeName = document.getElementById('licenseeName').value;
    const assigneeName = document.getElementById('assigneeName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const licenseInfo = { licenseeName, assigneeName, expiryDate };
    localStorage.setItem('licenseInfo', JSON.stringify(licenseInfo));
    document.getElementById('mask').style.display = 'none';
    document.getElementById('form').style.display = 'none';
  }

  function showLicenseForm() {
    const storedLicenseInfo = JSON.parse(localStorage.getItem('licenseInfo')) || {};
    document.getElementById('licenseeName').value = storedLicenseInfo.licenseeName || '';
    document.getElementById('assigneeName').value = storedLicenseInfo.assigneeName || '';
    document.getElementById('expiryDate').value = storedLicenseInfo.expiryDate || '2111-11-11';
    document.getElementById('mask').style.display = 'block';
    document.getElementById('form').style.display = 'block';
  }

  document.getElementById('search').addEventListener('input', async (event) => {
    const searchValue = event.target.value;
    const response = await fetch(`/search?search=${searchValue}`);
    const html = await response.text();
    document.getElementById('product-list').innerHTML = html;
  });

  document.getElementById('show-vmoptions-link').addEventListener('click', showVmoptions);
  document.getElementById('submit-license-info').addEventListener('click', submitLicenseInfo);
  document.getElementById('show-license-form-link').addEventListener('click', showLicenseForm);
  document.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', copyLicense));
});
