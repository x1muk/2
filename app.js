ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
            center: [59.937953996244964,30.343020559611883],
            zoom: 10,
            controls: []
        }, {
            searchControlProvider: 'yandex#search'
        }),
        objectManager = new ymaps.ObjectManager({
            // Чтобы метки начали кластеризоваться, выставляем опцию.
            clusterize: true,
            // ObjectManager принимает те же опции, что и кластеризатор.
            gridSize: 64,
            // Макет метки кластера pieChart.
            clusterIconLayout: "default#pieChart"
        });
    myMap.geoObjects.add(objectManager);

    // Создадим 5 пунктов выпадающего списка.
    var listBoxItems = ['Усадьба', 'Фотостудия', 'Загс', 'Парадные', 'Бар']
            .map(function (title) {
                return new ymaps.control.ListBoxItem({
                    data: {
                        content: title
                    },
                    state: {
                        selected: true
                    }
                })
            }),
        reducer = function (filters, filter) {
            filters[filter.data.get('content')] = filter.isSelected();
            return filters;
        },
        // Теперь создадим список, содержащий 5 пунктов.
        listBoxControl = new ymaps.control.ListBox({
            data: {
                content: 'Жмакай туть',
                title: 'Фильтр'
            },
            items: listBoxItems,
            state: {
                // Признак, развернут ли список.
                expanded: false,
                filters: listBoxItems.reduce(reducer, {})
            }
        });
    myMap.controls.add(listBoxControl);

    // Добавим отслеживание изменения признака, выбран ли пункт списка.
    listBoxControl.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl.state.set('filters', filters);
    });

    var filterMonitor = new ymaps.Monitor(listBoxControl.state);
    filterMonitor.add('filters', function (filters) {
        // Применим фильтр.
        objectManager.setFilter(getFilterFunction(filters));
    });

    function getFilterFunction(categories) {
        return function (obj) {
            var content = obj.properties.balloonContent;
            return categories[content]
        }
    }

    $.ajax({
        url: "/data.json"
    }).done(function (data) {
        objectManager.add(data);
    });

}