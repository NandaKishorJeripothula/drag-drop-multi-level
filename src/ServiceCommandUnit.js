import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import SubServiceCommandUnit from "./SubServiceCommandUnit";
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 1,
  margin: `0 0 ${grid}px 0`,
  width: "80%",
  // display: "inline-flex",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  margin: "10px 0"
});

export default class ServiceCommandUnit extends React.Component {
  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <Droppable droppableId={this.props.typeId} type={this.props.type}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {this.props.subItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div style={{ display: "flex" }}>
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
                          display: "block",
                          margin: "0 10px",
                          border: "1px solid #000"
                        }}
                      >
                        Drag
                      </span>
                      {item.subItems && (
                        <SubServiceCommandUnit
                          key={item.id}
                          subItems={item.subItems}
                          typeId={item.id}
                          type={`droppableSubSubItem`}
                        />
                      )}
                      {this.props.children}
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
    );
  }
}
