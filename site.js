$(function() {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const MONTH_OPTIONS_MARKUP = getMonths();
    const YEAR_OPTIONS_MARKUP = getYears();
    const DURATION_OPTIONS_MARKUP = getDurations();
    const termsForm = $('#terms-form');
    const termsInputs = {
        rate: $('[name="rate"]', termsForm),
        amount: $('[name="amount"]', termsForm),
        month: $('[name="month"]', termsForm),
        year: $('[name="year"]', termsForm),
        duration: $('[name="duration"]', termsForm),
    };
    const singleForm = $('#single-form');
    const singleInputs = {
        amount: $('[name="amount"]', singleForm),
        month: $('[name="month"]', singleForm),
        year: $('[name="year"]', singleForm),
    };
    const monthlyForm = $('#monthly-form');
    const monthlyInputs = {
        amount: $('[name="amount"]', monthlyForm),
        startMonth: $('[name="start-month"]', monthlyForm),
        startYear: $('[name="start-year"]', monthlyForm),
        endMonth: $('[name="end-month"]', monthlyForm),
        endYear: $('[name="end-year"]', monthlyForm),
    };

    let payoff;
    
    termsInputs.rate.val('0.04');
    termsInputs.amount.val('300000');
    termsInputs.month.html(MONTH_OPTIONS_MARKUP);
    termsInputs.year.html(YEAR_OPTIONS_MARKUP);
    termsInputs.duration.html(DURATION_OPTIONS_MARKUP);

    singleInputs.month.html(MONTH_OPTIONS_MARKUP);
    singleInputs.year.html(YEAR_OPTIONS_MARKUP);

    monthlyInputs.startMonth.html(MONTH_OPTIONS_MARKUP);
    monthlyInputs.startYear.html(YEAR_OPTIONS_MARKUP);
    monthlyInputs.endMonth.html(MONTH_OPTIONS_MARKUP);
    monthlyInputs.endYear.html(YEAR_OPTIONS_MARKUP);

    $('#terms-form').on('submit change keyup', onTermsSubmit);
    $('#single-form').on('submit', onSingleSubmit);
    $('#monthly-form').on('submit', onMonthlySubmit);
    onTermsSubmit();

    function onTermsSubmit(evt) {
        const terms = {
            duration: parseInt(termsInputs.duration.val(), 10),
            amount: parseFloat(termsInputs.amount.val()),
            rate: parseFloat(termsInputs.rate.val()),
            startYear: parseInt(termsInputs.year.val(), 10),
            startMonth: parseInt(termsInputs.month.val(), 10)
        };

        if(evt !== undefined) {
            evt.preventDefault();
        }

        if(typeof payoff === `undefined`) {
            payoff = new Payoff(terms);
        } else {
            payoff.update(terms);
        }

        render();
    }

    function onMonthlySubmit(evt) {
        evt.preventDefault();

        const amount = monthlyInputs.amount.val();
        const startMonth = monthlyInputs.startMonth.val();
        const startYear = monthlyInputs.startYear.val();
        const endMonth = monthlyInputs.endMonth.val();
        const endYear = monthlyInputs.endYear.val();

        payoff.addPayment({
            recurring: true,
            amount: parseFloat(amount),
            month: parseInt(startMonth, 10),
            year: parseInt(startYear, 10),
            endMonth: parseInt(endMonth, 10),
            endYear: parseInt(endYear, 10),
        });

        render();
    }

    function onSingleSubmit(evt) {
        evt.preventDefault();

        const amount = singleInputs.amount.val();
        const month = singleInputs.month.val();
        const year = singleInputs.year.val();

        payoff.addPayment({
            amount: parseFloat(amount),
            month: parseInt(month, 10),
            year: parseInt(year, 10),
        });

        render();
    }

    function render() {
        const monthlyPayment = payoff.monthlyPayment;

        let paid = 0;
        let interest = 0;
        let principalPaid = 0;

        let dates = ['x'];
        let principals = ['Principal'];
        let totalPaid = ['Total paid'];
        let principalPayments = ['Principal payment'];
        let reduced = ['Principal paid'];
        let interestPayments = [`Interest payment`];
        let interestPaid = ['Interest paid'];

        payoff.table.forEach((payment, i) => {
            paid += payment.paid;
            interest += payment.interestPaid;
            principalPaid += payment.principalPaid;

            dates.push(payment.date);
            principals.push(payment.principal);
            totalPaid.push(paid);
            reduced.push(principalPaid);
            interestPaid.push(interest);
        });

        let chart = c3.generate({
            size: {
                height: 600
            },
            data: {
                x: 'x',
                //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
                columns: [
                    dates,
                    principals,
                    totalPaid,
                    reduced,
                    interestPaid
                ]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: dateFormatter
                    }
                },
                y: {
                    min: 0,
                    padding: {
                        bottom: 0
                    },
                    tick: {
                        format: currencyFormatter
                    }
                }
            }
        });

        console.log(payoff);

        document.getElementById('monthly-payment').innerHTML = currencyFormatter(payoff.monthlyPayment);
        document.getElementById('total-paid').innerHTML = currencyFormatter(payoff.paid);
        document.getElementById('payoff-date').innerHTML = dateFormatter(payoff.payoffDate);
        document.getElementById('interest-paid').innerHTML = currencyFormatter(payoff.interestPaid);
    }

    function currencyFormatter(number) {
        var output = number.toFixed(2),
            split = output.split('.'),
            integer = split[0],
            decimal = split[1],
            integerResult = '',
            spliced,
            length;

        while(integer.length > 0) {
            length = integer.length;
            spliced = integer.substring(length-3);
            integer = integer.substring(0, length-3);

            if(integer.length > 0) {
                spliced = ','+spliced;
            }

            integerResult = spliced+integerResult;
        }
        
        return '$'+integerResult+'.'+decimal;
    }

    function dateFormatter(string) {
        var date = new Date(string);
        return MONTHS[date.getMonth()]+' '+date.getFullYear().toString();
    }

    function optionsFormatter(array, selected) {
        return array.reduce(function(markup, option) {
            var value = option.value,
                label = option.label,
                optionMarkup;
                
            optionMarkup = '<option value="'+value+'"';
            if(value === selected) {
                optionMarkup += ' selected="selected"';
            }
            optionMarkup += '>'+label+'</option>';

            return markup + optionMarkup;
        }, '');
    }

    function getYears() {
        var date = new Date(),
            year = date.getFullYear(),
            firstYear = year - 50,
            lastYear = year + 50,
            options = [ ];

        for(var i = firstYear; i < lastYear; i++) {
            options.push({
                value: i,
                label: i.toString()
            });
        }

        return optionsFormatter(options, year);
    }

    function getMonths() {
        var date = new Date(),
            currentMonth = date.getMonth(), // 0-indexed month
            options;

        options = MONTHS.map(function(month, i) {
            return {
                value: (i + 1),
                label: month
            };
        });

        return optionsFormatter(options, currentMonth);
    }

    function getDurations() {
        var defaultValue = 360, // default to 30 year mortgage
            options;

        options = [
            1,2,3,4,5,6,7,8,9,10,11,12,
            18,24,36,48,60,72,84,96,108,120,
            132,144,156,168,180,240,300,360,
            420,480,540,600
        ].map(function(numberOfMonths) {
            var yearsLabel = Math.floor(numberOfMonths / 12),
                monthsLabel = (numberOfMonths % 12),
                labels = [ ];

            if(yearsLabel > 0) {
                let label = yearsLabel+' year';
                if(yearsLabel > 1) {
                    label += 's';
                }
                labels.push(label);
            }

            if(monthsLabel > 0) {
                let label = monthsLabel+' month';
                if(monthsLabel > 1) {
                    label += 's';
                }
                labels.push(label);
            }

            return {
                value: numberOfMonths,
                label: labels.join(', ')
            };
        });

        return optionsFormatter(options, defaultValue);
    }
});