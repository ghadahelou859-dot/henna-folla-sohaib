const scroller =
  document.querySelector("#invitation");

const cover =
  document.querySelector("#cover");

const opening =
  document.querySelector("#opening");

const details =
  document.querySelector("#details");

const openingVideo =
  document.querySelector("#openingVideo");

const detailsVideo =
  document.querySelector("#detailsVideo");

const openButton =
  document.querySelector("#openInvite");

const music =
  document.querySelector("#backgroundMusic");

const musicToggle =
  document.querySelector("#musicToggle");

const daysElement =
  document.querySelector("#days");

const hoursElement =
  document.querySelector("#hours");

const minutesElement =
  document.querySelector("#minutes");

const secondsElement =
  document.querySelector("#seconds");

/*
  موعد الحنّة:
  16 سبتمبر 2026
  الساعة 5:00 مساءً
  بتوقيت فلسطين
*/

const countdownTarget = new Date(
  "2026-09-16T17:00:00+03:00"
).getTime();

/*
  فيديو المقدمة ينتقل عند الثانية 23
*/

const openingEndTime = 23;

let invitationOpened = false;
let introductionFinished = false;

/* الانتقال إلى صفحة */

function goTo(section, behavior = "smooth") {
  section.scrollIntoView({
    behavior: behavior,
    block: "start"
  });
}

/* تحديث العد التنازلي */

function updateCountdown() {
  const remaining = Math.max(
    0,
    countdownTarget - Date.now()
  );

  const totalSeconds = Math.floor(
    remaining / 1000
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  daysElement.textContent =
    String(days).padStart(2, "0");

  hoursElement.textContent =
    String(hours).padStart(2, "0");

  minutesElement.textContent =
    String(minutes).padStart(2, "0");

  secondsElement.textContent =
    String(seconds).padStart(2, "0");
}

updateCountdown();

setInterval(
  updateCountdown,
  1000
);

/* فتح الدعوة */

openButton.addEventListener(
  "click",
  async () => {
    if (invitationOpened) {
      return;
    }

    invitationOpened = true;

    openButton.classList.add("hidden");
    cover.classList.add("opened");

    opening.classList.remove("locked");
    opening.classList.add("playing");

    /*
      منع السحب أثناء فيديو المقدمة فقط
    */

    scroller.style.overflowY = "hidden";

    /*
      تشغيل الموسيقى
    */

    music.volume = 0.7;
    music.currentTime = 0;

    music
      .play()
      .catch(() => {});

    musicToggle.classList.add("visible");

    /*
      تشغيل فيديو المقدمة
    */

    openingVideo.currentTime = 0;

    goTo(opening);

    try {
      await openingVideo.play();
    } catch (error) {
      invitationOpened = false;

      openButton.classList.remove("hidden");
      cover.classList.remove("opened");

      opening.classList.remove("playing");
      opening.classList.add("locked");

      scroller.style.overflowY = "auto";

      music.pause();
      musicToggle.classList.remove("visible");

      goTo(cover, "auto");
    }
  }
);

/*
  إنهاء فيديو المقدمة
  وحذف الكفر والمقدمة من التمرير
*/

function finishIntroduction() {
  if (introductionFinished) {
    return;
  }

  introductionFinished = true;

  openingVideo.pause();

  opening.classList.remove("playing");

  /*
    إظهار الصفحات التالية
  */

  document
    .querySelectorAll(".page")
    .forEach((page) => {
      page.classList.remove("locked");
    });

  /*
    إيقاف الحركة مؤقتًا
  */

  scroller.style.scrollBehavior = "auto";

  /*
    حذف الكفر وفيديو المقدمة نهائيًا
    حتى لا تظهر شاشة سوداء عند الرجوع
  */

  cover.remove();
  opening.remove();

  /*
    تصبح صفحة المعلومات أول صفحة
  */

  scroller.scrollTop = 0;
  scroller.style.overflowY = "auto";

  requestAnimationFrame(() => {
    details.scrollIntoView({
      behavior: "auto",
      block: "start"
    });

    scroller.style.scrollBehavior = "";
  });

  /*
    تشغيل فيديو المعلومات
  */

  detailsVideo.currentTime = 0;

  detailsVideo
    .play()
    .catch(() => {});
}

/*
  الانتقال عند وصول المقدمة إلى الثانية 23
*/

openingVideo.addEventListener(
  "timeupdate",
  () => {
    if (
      openingVideo.currentTime >= openingEndTime
    ) {
      finishIntroduction();
    }
  }
);

/*
  حل احتياطي إذا انتهى الفيديو
*/

openingVideo.addEventListener(
  "ended",
  finishIntroduction
);

/* تشغيل وكتم الموسيقى */

musicToggle.addEventListener(
  "click",
  () => {
    if (music.paused) {
      music
        .play()
        .catch(() => {});

      musicToggle.classList.remove("muted");
      musicToggle.textContent = "♫";

      musicToggle.setAttribute(
        "aria-label",
        "كتم الموسيقى"
      );

      musicToggle.setAttribute(
        "aria-pressed",
        "false"
      );
    } else {
      music.pause();

      musicToggle.classList.add("muted");
      musicToggle.textContent = "♪";

      musicToggle.setAttribute(
        "aria-label",
        "تشغيل الموسيقى"
      );

      musicToggle.setAttribute(
        "aria-pressed",
        "true"
      );
    }
  }
);

/*
  فيديو المعلومات:
  يعمل فقط عندما تكون صفحته ظاهرة.
  المستخدم يستطيع السحب في أي وقت.
*/

const detailsObserver =
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== details) {
          return;
        }

        if (
          entry.isIntersecting &&
          entry.intersectionRatio > 0.65
        ) {
          detailsVideo
            .play()
            .catch(() => {});
        } else {
          detailsVideo.pause();
        }
      });
    },
    {
      root: scroller,
      threshold: [0, 0.65, 1]
    }
  );

detailsObserver.observe(details);

/* إعادة الكرت للكفر عند إعادة التحميل */

window.addEventListener(
  "pageshow",
  () => {
    if (!invitationOpened) {
      scroller.scrollTop = 0;

      openingVideo.pause();
      openingVideo.currentTime = 0;

      detailsVideo.pause();
      detailsVideo.currentTime = 0;
    }
  }
);
