import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ServiceCommandUnit from "./ServiceCommandUnit";
import SubServiceCommandUnit from "./SubServiceCommandUnit";
import { static_items } from "./data";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 200
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: static_items
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }
  mapFlatSubItemsItems(flatSubItems) {
    const newItemsList = this.state.items.map(item => {
      item.subItems = item.subItems.map(subItem => {
        return flatSubItems.find(newItem => newItem.id === subItem.id);
      });
      return item;
    });
    console.log("old State", this.state.items);
    console.log(newItemsList);
    this.setState({
      items: newItemsList
    });
    return newItemsList;
  }

  mapSubItemsItemS(subItems, items) {
    const newItems = items.map(item => {
      item.subItems = item.subItems.map(subItem => {
        return subItems.find(newItem => newItem.id === subItem.id);
      });
      return item;
    });
    return newItems;
  }
  onDragEnd(result) {
    // dropped outside the list
    console.log(result);
    console.log("innner drag");
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (result.type === "droppableItem") {
      const items = reorder(this.state.items, sourceIndex, destIndex);

      this.setState({
        items
      });
    } else if (result.type === "droppableSubItem") {
      console.log("called in subLevel not subsub");
      const itemSubItemMap = this.state.items.reduce((acc, item) => {
        acc[item.id] = item.subItems;
        return acc;
      }, {});

      const sourceParentId = parseInt(result.source.droppableId);
      const destParentId = parseInt(result.destination.droppableId);

      const sourceSubItems = itemSubItemMap[sourceParentId];
      const destSubItems = itemSubItemMap[destParentId];

      let newItems = [...this.state.items];

      /** In this case subItems are reOrdered inside same Parent */
      if (sourceParentId === destParentId) {
        const reorderedSubItems = reorder(
          sourceSubItems,
          sourceIndex,
          destIndex
        );
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = reorderedSubItems;
          }
          return item;
        });
        this.setState({
          items: newItems
        });
      } else {
        let newSourceSubItems = [...sourceSubItems];
        const [draggedItem] = newSourceSubItems.splice(sourceIndex, 1);

        let newDestSubItems = [...destSubItems];
        newDestSubItems.splice(destIndex, 0, draggedItem);
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = newSourceSubItems;
          } else if (item.id === destParentId) {
            item.subItems = newDestSubItems;
          }
          return item;
        });
        this.setState({
          items: newItems
        });
      }
    } else if (result.type === "droppableSubSubItem") {
      console.log("Hey its called me");
      const subItems = this.state.items.map(
        item =>
          item.subItems &&
          item.subItems.reduce((acc, subItem) => {
            // console.log(typeof acc);
            acc.push(subItem);
            return acc;
          }, [])
      );
      const flatSubItems = subItems.reduce(
        (accum, subItems) => accum.concat(subItems),
        []
      );

      // const subItems = this.state.items.reduce((acc = [], subItem) => {
      //   // console.log(typeof acc);
      //   acc.push(subItem);
      //   return acc;
      // }, []);
      console.log(flatSubItems);

      const itemSubItemMap = flatSubItems.reduce((acc, item) => {
        acc[item.id] = item.subItems;
        return acc;
      }, {});

      const sourceParentId = parseInt(result.source.droppableId);
      const destParentId = parseInt(result.destination.droppableId);

      const sourceSubItems = itemSubItemMap[sourceParentId];
      const destSubItems = itemSubItemMap[destParentId];

      let newItems = [...flatSubItems];

      /** In this case subItems are reOrdered inside same Parent */
      if (sourceParentId === destParentId) {
        const reorderedSubItems = reorder(
          sourceSubItems,
          sourceIndex,
          destIndex
        );
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = reorderedSubItems;
          }
          return item;
        });
        // this.setState({
        //   items: newItems
        // });
        //New SubItems addded subsub
        console.log(newItems);
        // this.mapFlatSubItemsItems(newItems);
        this.setState({
          items: this.mapSubItemsItemS(newItems, this.state.items)
        });
      } else {
        let newSourceSubItems = [...sourceSubItems];
        const [draggedItem] = newSourceSubItems.splice(sourceIndex, 1);

        let newDestSubItems = [...destSubItems];
        newDestSubItems.splice(destIndex, 0, draggedItem);
        newItems = newItems.map(item => {
          if (item.id === sourceParentId) {
            item.subItems = newSourceSubItems;
          } else if (item.id === destParentId) {
            item.subItems = newDestSubItems;
          }
          return item;
        });
        // this.setState({
        //   items: newItems
        // });
        //New SubItems addded subsub
        console.log(newItems);
        // this.mapFlatSubItemsItems(newItems);
        this.setState({
          items: this.mapSubItemsItemS(newItems, this.state.items)
        });
      }
    }
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable" type="droppableItem">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.state.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        {item.content}
                        <span
                          {...provided.dragHandleProps}
                          style={{
                            display: "inline-block",
                            margin: "0 10px",
                            border: "1px solid #000"
                          }}
                        >
                          Drag
                        </span>
                        {/* {console.log(item.subItems[1])} */}
                        <ServiceCommandUnit
                          subItems={item.subItems}
                          typeId={item.id}
                          type={`droppableSubItem`}
                        />
                        {/* {item.subItems.map(subItem => {
                          if (subItem.subItems) {
                            console.log(subItem);
                            return (
                              <SubServiceCommandUnit
                                key={subItem.id}
                                subItems={subItem.subItems}
                                typeId={item.id}
                                type={`droppable`}
                              />
                            );
                          }
                          return null;
                        })} */}
                        {/* </ServiceCommandUnit> */}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

// Put the thing into the DOM!
ReactDOM.render(
  <section>
    <App />
  </section>,
  document.getElementById("root")
);
