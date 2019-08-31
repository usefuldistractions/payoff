$(function() {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const MONTH_OPTIONS_MARKUP = getMonths();
    const YEAR_OPTIONS_MARKUP = getYears();
    const DURATION_OPTIONS_MARKUP = getDurations();

    $('#input-rate')[0].value = '0.04';
    $('#input-amount')[0].value = '300000';
    $('#input-month').html(MONTH_OPTIONS_MARKUP);
    $('#input-year').html(YEAR_OPTIONS_MARKUP);
    $('#input-duration').html(DURATION_OPTIONS_MARKUP);

    $('form').on('submit change keyup', onSubmit);
    onSubmit();

    function onSubmit(evt) {
        if(evt !== undefined) {
            evt.preventDefault();
        }

        var payoff;

        payoff = new Payoff({
            duration: parseInt(document.getElementById('input-duration').value, 10),
            amount: parseFloat(document.getElementById('input-amount').value),
            rate: parseFloat(document.getElementById('input-rate').value),
            startYear: parseInt(document.getElementById('input-year').value, 10),
            startMonth: parseInt(document.getElementById('input-month').value, 10)
        });

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
            paid += monthlyPayment;
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